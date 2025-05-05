
import PreviewStatCards from "./PreviewStatCards";
import PreviewExpenseChart from "./PreviewExpenseChart";
import { mockData } from "./mockDashboardData";

export default function DashboardPreview() {
  return (
    <div className="space-y-6">
      <PreviewStatCards data={mockData} />
      <PreviewExpenseChart data={mockData.expenseData} />
    </div>
  );
}
