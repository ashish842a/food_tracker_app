import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { LogOut, UtensilsCrossed, CalendarDays, IndianRupee, TrendingUp, Pencil, Trash2, Download } from "lucide-react";
import { exportMonthlyCSV } from "@/lib/exportCSV";
import AddFoodDialog from "@/components/AddFoodDialog";

import {
  getUserEntries,
  getDailyExpenseBreakdown,
  getMealTypeExpense,
  deleteEntry,
  updateEntry,
  FoodEntry,
  MealType,
} from "@/lib/foodStore";

const COLORS = ["hsl(145, 45%, 32%)", "hsl(38, 70%, 55%)", "hsl(200, 60%, 50%)", "hsl(340, 60%, 50%)"];

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const [editEntry, setEditEntry] = useState<FoodEntry | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  /* ✅ FIXED RELOAD (CRITICAL FIX) */

  const reload = async () => {
    if (!user) return;

    const data = await getUserEntries();

    console.log("Server entries:", data); // Debug safe

    setEntries(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    reload();
  }, [user]);

  const today = new Date().toISOString().slice(0, 10);

  const todayEntries = useMemo(
    () => entries.filter(e => e.date === today),
    [entries, today]
  );

  const monthEntries = useMemo(
    () => entries.filter(e => e.date.startsWith(selectedMonth)),
    [entries, selectedMonth]
  );

  const dateEntries = useMemo(
    () => entries.filter(e => e.date === selectedDate),
    [entries, selectedDate]
  );

  const monthlyExpense = useMemo(
    () =>
      monthEntries
        .filter(e => e.price !== null)
        .reduce((s, e) => s + (e.price || 0), 0),
    [monthEntries]
  );

  const totalMeals = entries.length;

  const daysTracked = useMemo(
    () => new Set(entries.map(e => e.date)).size,
    [entries]
  );

  /* ✅ FIXED DAILY BREAKDOWN */

  const dailyBreakdown = useMemo(() => {
    const map: Record<string, number> = {};

    monthEntries.forEach(entry => {
      if (!entry.price) return;

      map[entry.date] = (map[entry.date] || 0) + entry.price;
    });

    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, amount]) => ({
        date: date.slice(5),
        amount,
      }));
  }, [monthEntries]);

  /* ✅ FIXED MEAL BREAKDOWN */

  const mealExpense = useMemo(() => {
    const map: Record<string, number> = {};

    monthEntries.forEach(entry => {
      if (!entry.price) return;

      map[entry.mealType] = (map[entry.mealType] || 0) + entry.price;
    });

    return Object.entries(map)
      .filter(([_, v]) => v > 0)
      .map(([name, value]) => ({
        name,
        value,
      }));
  }, [monthEntries]);

  const handleDelete = async (id: string) => {
    if (!user) return;

    await deleteEntry(id);
    reload();
  };

  const handleEdit = (entry: FoodEntry) => {
    setEditEntry(entry);
    setEditDialogOpen(true);
  };

  const handleEdited = () => {
    setEditEntry(null);
    setEditDialogOpen(false);
    reload();
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
       <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b bg-card">
              <div className="container flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                    <UtensilsCrossed className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold">Food Tracker</h1>
                    <p className="text-xs text-muted-foreground">Hi, {user.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <AddFoodDialog onAdded={() => reload()} />
                  <Button variant="outline" size="icon" onClick={logout}><LogOut className="h-4 w-4" /></Button>
                </div>
              </div>
            </header>
      
            <main className="container py-6 space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2"><UtensilsCrossed className="h-5 w-5 text-primary" /></div>
                      <div>
                        <p className="text-2xl font-bold">{todayEntries.length}</p>
                        <p className="text-xs text-muted-foreground">Today's Meals</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-secondary/10 p-2"><IndianRupee className="h-5 w-5 text-secondary" /></div>
                      <div>
                        <p className="text-2xl font-bold">₹{monthlyExpense.toFixed(0)}</p>
                        <p className="text-xs text-muted-foreground">This Month</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2"><TrendingUp className="h-5 w-5 text-primary" /></div>
                      <div>
                        <p className="text-2xl font-bold">{totalMeals}</p>
                        <p className="text-xs text-muted-foreground">Total Meals</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-secondary/10 p-2"><CalendarDays className="h-5 w-5 text-secondary" /></div>
                      <div>
                        <p className="text-2xl font-bold">{daysTracked}</p>
                        <p className="text-xs text-muted-foreground">Days Tracked</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
      
              <Tabs defaultValue="today" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="today">Today</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                  <TabsTrigger value="reports">Reports</TabsTrigger>
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                </TabsList>
      
                {/* Today Tab */}
                <TabsContent value="today" className="space-y-4">
                  <Card>
                    <CardHeader><CardTitle>Today's Food Log</CardTitle></CardHeader>
                    <CardContent>
                      {todayEntries.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">No entries yet today. Add your first meal!</p>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Food</TableHead>
                              <TableHead>Qty</TableHead>
                              <TableHead>Meal</TableHead>
                              <TableHead>Price</TableHead>
                              <TableHead className="w-20">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {todayEntries.map(e => (
                              <TableRow key={e.id}>
                                <TableCell className="font-medium">{e.foodName}</TableCell>
                                <TableCell>{e.quantity || "—"}</TableCell>
                                <TableCell>{e.mealType}</TableCell>
                                <TableCell>{e.price !== null ? `₹${e.price}` : "—"}</TableCell>
                                <TableCell>
                                  <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(e)}><Pencil className="h-3.5 w-3.5" /></Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(e.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
      
                {/* History Tab */}
                <TabsContent value="history" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Food History</CardTitle>
                        <Input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-auto" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      {dateEntries.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">No entries for this date.</p>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Food</TableHead>
                              <TableHead>Qty</TableHead>
                              <TableHead>Meal</TableHead>
                              <TableHead>Price</TableHead>
                              <TableHead className="w-20">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {dateEntries.map(e => (
                              <TableRow key={e.id}>
                                <TableCell className="font-medium">{e.foodName}</TableCell>
                                <TableCell>{e.quantity || "—"}</TableCell>
                                <TableCell>{e.mealType}</TableCell>
                                <TableCell>{e.price !== null ? `₹${e.price}` : "—"}</TableCell>
                                <TableCell>
                                  <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(e)}><Pencil className="h-3.5 w-3.5" /></Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(e.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
      
                {/* Reports Tab */}
                <TabsContent value="reports" className="space-y-4">
                  <div className="flex justify-end">
                    <Input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="w-auto" />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader><CardTitle>Daily Expense Trend</CardTitle></CardHeader>
                      <CardContent>
                        {dailyBreakdown.length === 0 ? (
                          <p className="text-center text-muted-foreground py-8">No expense data for this month.</p>
                        ) : (
                          <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={dailyBreakdown}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" fontSize={12} />
                              <YAxis fontSize={12} />
                              <Tooltip formatter={(v: number) => `₹${v}`} />
                              <Bar dataKey="amount" fill="hsl(145, 45%, 32%)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        )}
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader><CardTitle>Meal Type Breakdown</CardTitle></CardHeader>
                      <CardContent>
                        {mealExpense.length === 0 ? (
                          <p className="text-center text-muted-foreground py-8">No expense data for this month.</p>
                        ) : (
                          <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                              <Pie data={mealExpense} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ₹${value}`}>
                                {mealExpense.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                              </Pie>
                              <Tooltip formatter={(v: number) => `₹${v}`} />
                            </PieChart>
                          </ResponsiveContainer>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
      
                {/* Monthly Tab */}
                <TabsContent value="monthly" className="space-y-4">
                  <div className="flex justify-end gap-2">
                    <Input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="w-auto" />
                    <Button variant="outline" onClick={() => exportMonthlyCSV(monthEntries, selectedMonth)} disabled={monthEntries.length === 0}>
                      <Download className="mr-2 h-4 w-4" /> Export CSV
                    </Button>
                  </div>
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Monthly Summary</CardTitle>
                        <div className="text-right">
                          <p className="text-2xl font-bold">₹{monthlyExpense.toFixed(0)}</p>
                          <p className="text-xs text-muted-foreground">Total Expense</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {monthEntries.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">No entries for this month.</p>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Food</TableHead>
                              <TableHead>Meal</TableHead>
                              <TableHead>Price</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {monthEntries.sort((a, b) => a.date.localeCompare(b.date)).map(e => (
                              <TableRow key={e.id}>
                                <TableCell>{e.date}</TableCell>
                                <TableCell className="font-medium">{e.foodName}</TableCell>
                                <TableCell>{e.mealType}</TableCell>
                                <TableCell>{e.price !== null ? `₹${e.price}` : "—"}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </main>
      
            {/* Edit dialog */}
            {editEntry && (
              <AddFoodDialog
                onAdded={() => {}}
                editEntry={editEntry}
                onEdit={handleEdited}
                open={editDialogOpen}
                onOpenChange={(v) => { setEditDialogOpen(v); if (!v) setEditEntry(null); }}
              />
            )}
          </div>
    </div>
  );
};

export default Dashboard;
