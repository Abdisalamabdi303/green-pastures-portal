
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie } from 'recharts';

// Mock data for charts
const expenseData = [
  { month: 'Jan', feed: 120000, medicine: 45000, other: 75000 },
  { month: 'Feb', feed: 125000, medicine: 52000, other: 78000 },
  { month: 'Mar', feed: 130000, medicine: 46000, other: 86000 },
  { month: 'Apr', feed: 127000, medicine: 49000, other: 82000 },
  { month: 'May', feed: 135000, medicine: 53000, other: 77000 },
  { month: 'Jun', feed: 140000, medicine: 57000, other: 78000 },
];

const expenseBreakdown = [
  { name: 'Feed', value: 140000, color: '#94cf43' },
  { name: 'Medicine', value: 57000, color: '#b68051' },
  { name: 'Veterinary', value: 38000, color: '#79c215' },
  { name: 'Labor', value: 25000, color: '#619c11' },
  { name: 'Equipment', value: 15000, color: '#c1986a' },
];

// Mock data for expense table
const recentExpenses = [
  { date: '2023-06-25', category: 'Feed', animals: 250, amount: 12500 },
  { date: '2023-06-24', category: 'Medicine', animals: 45, amount: 8700 },
  { date: '2023-06-23', category: 'Veterinary', animals: 12, amount: 15000 },
  { date: '2023-06-22', category: 'Feed', animals: 250, amount: 12500 },
  { date: '2023-06-21', category: 'Equipment', animals: null, amount: 7500 },
];

export default function ReportPreview() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Expense Trend Chart */}
        <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Expense Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={expenseData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`₹${value}`, '']} />
                  <Legend />
                  <Bar dataKey="feed" stackId="a" name="Feed" fill="#94cf43" />
                  <Bar dataKey="medicine" stackId="a" name="Medicine" fill="#b68051" />
                  <Bar dataKey="other" stackId="a" name="Other" fill="#619c11" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Expense Distribution Pie Chart */}
        <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Expense Distribution (June)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {expenseBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`₹${value}`, '']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Expenses Table */}
      <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Animals Affected</TableHead>
                <TableHead className="text-right">Amount (₹)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentExpenses.map((expense, index) => (
                <TableRow key={index}>
                  <TableCell>{expense.date}</TableCell>
                  <TableCell>{expense.category}</TableCell>
                  <TableCell>{expense.animals || 'N/A'}</TableCell>
                  <TableCell className="text-right">{expense.amount.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
