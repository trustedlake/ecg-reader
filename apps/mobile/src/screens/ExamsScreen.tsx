import { useCallback, useRef, useState } from 'react'
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { Button, colors, useAuth } from 'shared'
import type { Exam } from 'shared'
import { useApi } from '../api/ApiProvider'
import type { AppScreenProps } from '../navigation/types'
import { ErrorNotice, LoadingView, StatusBadge } from '../ui/Feedback'
import { SEX_LABELS, formatDateTime } from '../ui/labels'
import Screen from '../ui/Screen'

export default function ExamsScreen({ navigation }: AppScreenProps<'Exams'>) {
  const { api } = useApi()
  const { logout, user } = useAuth()
  const [exams, setExams] = useState<Exam[] | null>(null)
  const [nextPage, setNextPage] = useState<number | null>(null)
  const [error, setError] = useState<unknown>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const loadedOnce = useRef(false)

  const load = useCallback(
    async (mode: 'initial' | 'refresh') => {
      if (mode === 'refresh') setRefreshing(true)
      setError(null)
      try {
        const page = await api.listExams(1)
        setExams(page.results)
        setNextPage(page.next ? 2 : null)
      } catch (err) {
        setError(err)
      } finally {
        setRefreshing(false)
      }
    },
    [api],
  )

  // Recarrega ao voltar para a lista (um exame pode ter mudado de estado).
  useFocusEffect(
    useCallback(() => {
      void load(loadedOnce.current ? 'refresh' : 'initial')
      loadedOnce.current = true
    }, [load]),
  )

  async function loadMore() {
    if (!nextPage || loadingMore) return
    setLoadingMore(true)
    try {
      const page = await api.listExams(nextPage)
      setExams((current) => [...(current ?? []), ...page.results])
      setNextPage(page.next ? nextPage + 1 : null)
    } catch (err) {
      setError(err)
    } finally {
      setLoadingMore(false)
    }
  }

  const logoutButton = (
    <Button variant="text" onPress={logout} accessibilityLabel="Sair da conta">
      Sair
    </Button>
  )

  return (
    <Screen
      title="Exames"
      right={logoutButton}
      scroll={false}
      footer={
        <Button fullWidth onPress={() => navigation.navigate('NewExam')} testID="new-exam">
          Novo exame
        </Button>
      }
    >
      {exams === null && !error ? (
        <LoadingView message="Carregando exames…" />
      ) : (
        <FlatList
          data={exams ?? []}
          keyExtractor={(exam) => exam.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load('refresh')} />}
          onEndReached={() => void loadMore()}
          onEndReachedThreshold={0.3}
          ListHeaderComponent={
            <View style={styles.header}>
              {user?.name ? <Text style={styles.greeting}>Olá, {user.name}</Text> : null}
              {error != null && <ErrorNotice error={error} onRetry={() => void load('refresh')} />}
            </View>
          }
          ListEmptyComponent={
            error ? null : (
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>Nenhum exame ainda</Text>
                <Text style={styles.emptyText}>Toque em "Novo exame" para fotografar o primeiro ECG.</Text>
              </View>
            )
          }
          ListFooterComponent={loadingMore ? <LoadingView message="Carregando mais…" /> : null}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => navigation.navigate('ExamDetail', { examId: item.id })}
              accessibilityRole="button"
              accessibilityLabel={`Exame de ${item.patient.name}, ${item.patient.age} anos`}
              style={({ pressed }) => [styles.card, pressed && styles.pressed]}
            >
              <View style={styles.cardTop}>
                <Text style={styles.name} numberOfLines={1}>
                  {item.patient.name}
                </Text>
                <Text style={styles.date}>{formatDateTime(item.created_at)}</Text>
              </View>
              <Text style={styles.meta}>
                {item.patient.age} anos{item.patient.sex ? ` · ${SEX_LABELS[item.patient.sex]}` : ''}
              </Text>
              <StatusBadge status={item.status} />
            </Pressable>
          )}
        />
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 12, flexGrow: 1 },
  header: { gap: 12 },
  greeting: { fontSize: 16, color: colors.textMuted },
  card: {
    gap: 6,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gridBorder,
    backgroundColor: colors.white,
  },
  pressed: { backgroundColor: colors.background },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 },
  name: { flex: 1, fontSize: 17, fontWeight: '700', color: colors.dark },
  date: { fontSize: 13, color: colors.textMuted },
  meta: { fontSize: 14, color: colors.textLight },
  empty: { alignItems: 'center', gap: 6, paddingVertical: 48 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: colors.dark },
  emptyText: { fontSize: 15, color: colors.textMuted, textAlign: 'center' },
})
