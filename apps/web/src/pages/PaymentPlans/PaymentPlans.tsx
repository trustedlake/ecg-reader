import PageHeader from '../../components/nav/PageHeader'
import AppBrandHeader from '../../components/nav/AppBrandHeader'
import { Button } from 'shared'
import styles from './PaymentPlans.module.css'

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
      <Button fullWidth variant={highlighted ? 'primary' : 'outline'} onPress={onSelect}>
        Subscribe
      </Button>
    </div>
  )
}

const plans = [
  {
    name: 'Essential',
    price: '$9.99',
    features: ['10 exams/month', 'Automatic report', 'Email support'],
    highlighted: false,
  },
  {
    name: 'Professional',
    price: '$19.99',
    features: ['50 exams/month', 'Automatic report', 'Priority support', 'PDF export'],
    highlighted: true,
  },
  {
    name: 'Premium',
    price: '$34.99',
    features: ['Unlimited exams', 'Automatic report', '24/7 support', 'PDF export', 'API access'],
    highlighted: false,
  },
]

export default function PaymentPlans() {
  return (
    <div className={styles.page}>
      <AppBrandHeader />
      <PageHeader title="Payment Plans" />

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
