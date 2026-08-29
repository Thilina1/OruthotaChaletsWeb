'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Coffee, UtensilsCrossed } from 'lucide-react';

type ChaletPackage = {
  id: string;
  name: string;
  description?: string;
  includes_breakfast: boolean;
  includes_lunch: boolean;
  includes_dinner: boolean;
  sort_order: number;
  is_active: boolean;
};

type ChaletOccupancyType = {
  id: string;
  name: string;
  max_guests?: number;
  sort_order?: number;
};

type ChaletRate = {
  package_id: string;
  occupancy_type_id: string;
  rate_per_night: number;
};

function formatLKR(n: number) {
  return `LKR ${n.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`;
}

function mealLabel(pkg: ChaletPackage) {
  return [
    pkg.includes_breakfast && 'B',
    pkg.includes_lunch && 'L',
    pkg.includes_dinner && 'D',
  ].filter(Boolean).join('/') || 'None';
}

export function RoomRatesPackages() {
  const { toast } = useToast();
  const [packages, setPackages] = useState<ChaletPackage[]>([]);
  const [occupancyTypes, setOccupancyTypes] = useState<ChaletOccupancyType[]>([]);
  const [rateMatrix, setRateMatrix] = useState<Record<string, Record<string, number>>>({});
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [pkgRes, occRes, ratesRes] = await Promise.all([
        supabase.from('chalet_packages').select('*').order('sort_order'),
        supabase.from('chalet_occupancy_types').select('*').order('sort_order'),
        supabase.from('chalet_rates').select('*'),
      ]);
      const rates: ChaletRate[] = ratesRes.data ?? [];
      setPackages(pkgRes.data ?? []);
      setOccupancyTypes(occRes.data ?? []);
      const matrix: Record<string, Record<string, number>> = {};
      rates.forEach(r => {
        if (!matrix[r.occupancy_type_id]) matrix[r.occupancy_type_id] = {};
        matrix[r.occupancy_type_id][r.package_id] = Number(r.rate_per_night);
      });
      setRateMatrix(matrix);
    } catch {
      toast({ title: 'Error', description: 'Failed to load rates data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <p className="text-xs font-bold tracking-[0.3em] text-primary uppercase mb-2">Pricing</p>
          <h2 className="font-headline text-3xl md:text-4xl text-foreground">Room Rates & Packages</h2>
          <p className="text-muted-foreground mt-2">Chalet rate matrix and meal packages</p>
        </div>

        <div className="space-y-10">
          {/* Packages */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Packages</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-4 space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Package Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-center">Breakfast</TableHead>
                        <TableHead className="text-center">Lunch</TableHead>
                        <TableHead className="text-center">Dinner</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {packages.map(pkg => (
                        <TableRow key={pkg.id}>
                          <TableCell className="font-medium">{pkg.name}</TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                            {pkg.description || '—'}
                          </TableCell>
                          <TableCell className="text-center">
                            {pkg.includes_breakfast
                              ? <Coffee className="h-4 w-4 text-green-600 mx-auto" />
                              : <span className="text-muted-foreground text-xs">—</span>}
                          </TableCell>
                          <TableCell className="text-center">
                            {pkg.includes_lunch
                              ? <UtensilsCrossed className="h-4 w-4 text-green-600 mx-auto" />
                              : <span className="text-muted-foreground text-xs">—</span>}
                          </TableCell>
                          <TableCell className="text-center">
                            {pkg.includes_dinner
                              ? <UtensilsCrossed className="h-4 w-4 text-green-600 mx-auto" />
                              : <span className="text-muted-foreground text-xs">—</span>}
                          </TableCell>
                        </TableRow>
                      ))}
                      {packages.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            No packages available.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Rate Matrix */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Rate Matrix</CardTitle>
                <CardDescription>
                  Rates per night (LKR) for each package × occupancy combination. A +10% service charge applies.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-40">Occupancy</TableHead>
                          {packages.map(pkg => (
                            <TableHead key={pkg.id} className="text-center min-w-36">
                              <div>{pkg.name}</div>
                              <div className="text-xs font-normal text-muted-foreground">Meals: {mealLabel(pkg)}</div>
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {occupancyTypes.map(ot => (
                          <TableRow key={ot.id}>
                            <TableCell className="font-medium">
                              {ot.name}
                              {ot.max_guests && (
                                <span className="text-xs text-muted-foreground ml-1">(max {ot.max_guests})</span>
                              )}
                            </TableCell>
                            {packages.map(pkg => (
                              <TableCell key={pkg.id} className="text-center text-sm">
                                {formatLKR(rateMatrix[ot.id]?.[pkg.id] ?? 0)}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <p className="text-xs text-muted-foreground mt-3 text-right">
                      * All rates are per night (LKR). A 10% service charge will be added on bookings.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
