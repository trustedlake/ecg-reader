import Header from '../../components/Header/Header'
import Button from '../../components/Button/Button'
import styles from './PlanosPagamento.module.css'

interface PlanCardProps {
  name: string
  price: string
  features: string[]
  highlighted?: boolean
  onSelect: () => void
}

function PlanCard({ name, price, features, highlighted, onSelect }: PlanCardProps) {
  return (
    <div className={`${styles.planCard} ${highlighted ? styles.highlighted : ''}`}>
      <h3 className={styles.planName}>{name}</h3>
      <p className={styles.planPrice}>
        <span className={styles.priceValue}>{price}</span>
      </p>
      <ul className={styles.featuresList}>
        {features.map((f) => (
          <li key={f} className={styles.feature}>{f}</li>
        ))}
      </ul>
      <Button fullWidth variant={highlighted ? 'primary' : 'outline'} onClick={onSelect}>
        {highlighted ? 'Assinar' : 'Assinar'}
      </Button>
    </div>
  )
}

const plans = [
  {
    name: 'Essencial',
    price: 'R$ 29,90',
    features: ['10 exames/mês', 'Laudo automático', 'Suporte por email'],
    highlighted: false,
  },
  {
    name: 'Profissional',
    price: 'R$ 59,90',
    features: ['50 exames/mês', 'Laudo automático', 'Suporte prioritário', 'Exportação PDF'],
    highlighted: true,
  },
  {
    name: 'Premium',
    price: 'R$ 99,90',
    features: ['Exames ilimitados', 'Laudo automático', 'Suporte 24h', 'Exportação PDF', 'API access'],
    highlighted: false,
  },
]

export default function PlanosPagamento() {
  return (
    <div className={styles.page}>
      <Header title="Planos de Pagamento" />

      <div className={styles.content}>
        {plans.map((plan) => (
          <PlanCard
            key={plan.name}
            name={plan.name}
            price={plan.price}
            features={plan.features}
            highlighted={plan.highlighted}
            onSelect={() => {}}
          />
        ))}
      </div>
    </div>
  )
}
