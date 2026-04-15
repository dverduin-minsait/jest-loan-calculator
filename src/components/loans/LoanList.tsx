import { LoanCard } from "./LoanCard";

interface Loan {
  id: string;
  name: string;
  amount: number;
  interest: number;
  partialAmortRate: number;
  totalAmortRate: number;
  months: number;
}

interface LoanListProps {
  loans: Loan[];
}

export function LoanList({ loans }: LoanListProps) {
  if (loans.length === 0) {
    return <p className="text-gray-500 text-sm">No loans to display.</p>;
  }

  return (
    <div className="space-y-3">
      {loans.map((loan) => (
        <LoanCard key={loan.id} loan={loan} />
      ))}
    </div>
  );
}
