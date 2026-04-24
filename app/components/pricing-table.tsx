"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, MapPin } from "lucide-react"

type FeeRow = {
  range: string
  fee: number
  time?: number
}

const rjUnits = ["Rio Sul", "Botafogo", "Fashion Mall", "Icaraí", "Ipanema", "RDL", "Tijuca", "RDB"]

const rjTable: FeeRow[] = [
  { range: "até 2 km", fee: 14.9 },
  { range: "2 a 3 km", fee: 15.5 },
  { range: "3 a 4,5 km", fee: 15.9 },
  { range: "4,5 a 6,5 km", fee: 16.9 },
  { range: "6,5 a 7,5 km", fee: 17.9 },
  { range: "7,5 a 9,5 km", fee: 19.9 },
  { range: "9,5 a 12 km", fee: 23.9 },
  { range: "12 a 15 km", fee: 28.9 },
  { range: "acima de 15 km", fee: 29.9 },
]

const bsbTable: FeeRow[] = [
  { range: "até 2 km", fee: 15.9 },
  { range: "2 a 3 km", fee: 16.9 },
  { range: "3 a 5 km", fee: 17.9 },
  { range: "5 a 6 km", fee: 17.9 },
  { range: "6 a 9 km", fee: 22.9 },
  { range: "9 a 12 km", fee: 25.9 },
  { range: "12 a 15 km", fee: 27.9 },
  { range: "acima de 15 km", fee: 29.9 },
]

const spTable: FeeRow[] = [
  { range: "até 1 km", fee: 13.9 },
  { range: "1 a 2 km", fee: 16.9 },
  { range: "2 a 3 km", fee: 17.9 },
  { range: "3 a 4 km", fee: 18.9 },
  { range: "4 a 5 km", fee: 19.9 },
  { range: "5 a 6 km", fee: 19.9 },
  { range: "6 a 7 km", fee: 20.9 },
  { range: "7 a 8 km", fee: 21.9 },
  { range: "8 a 9 km", fee: 22.9 },
  { range: "9 a 10 km", fee: 23.9 },
]

function formatBRL(value: number) {
  return `R$ ${value.toFixed(2).replace(".", ",")}`
}

function FeeTable({ rows, showTime = false }: { rows: FeeRow[]; showTime?: boolean }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full">
        <thead className="bg-muted/60">
          <tr>
            <th className="px-3 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Faixa
            </th>
            {showTime && (
              <th className="px-3 py-3 text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Tempo
              </th>
            )}
            <th className="px-3 py-3 text-right font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Valor
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr
              key={row.range}
              className={`border-t border-border ${idx % 2 === 0 ? "bg-card" : "bg-muted/20"}`}
            >
              <td className="px-3 py-3 text-sm text-foreground">{row.range}</td>
              {showTime && (
                <td className="px-3 py-3 text-center font-mono text-xs text-muted-foreground">
                  {row.time ? `${row.time} min` : "—"}
                </td>
              )}
              <td className="px-3 py-3 text-right">
                <span className="font-serif text-base text-primary">{formatBRL(row.fee)}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function PricingTable() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-foreground">Tabela de Fretes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Valores praticados por faixa de distância. A regra &quot;até X km&quot; considera distâncias inferiores a esse
          limite (ex: até 2 km = de 0 a 1,99 km).
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* RJ */}
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="border-b border-border bg-muted/40 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 font-serif text-xl font-normal text-foreground">
                  <MapPin strokeWidth={1.5} className="h-5 w-5 text-primary" />
                  Rio de Janeiro
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Aplicável às unidades do RJ
                </CardDescription>
              </div>
              <span className="rounded-md border border-primary/20 bg-primary/5 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-primary">
                RJ
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Unidades incluídas
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {rjUnits.map((unit) => (
                  <span
                    key={unit}
                    className="rounded border border-border bg-muted/40 px-2 py-0.5 text-xs text-foreground"
                  >
                    {unit}
                  </span>
                ))}
              </div>
            </div>
            <FeeTable rows={rjTable} />
          </CardContent>
        </Card>

        {/* BSB */}
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="border-b border-border bg-muted/40 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 font-serif text-xl font-normal text-foreground">
                  <MapPin strokeWidth={1.5} className="h-5 w-5 text-primary" />
                  Brasília
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Aplicável à unidade de BSB
                </CardDescription>
              </div>
              <span className="rounded-md border border-primary/20 bg-primary/5 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-primary">
                BSB
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Unidades incluídas
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="rounded border border-border bg-muted/40 px-2 py-0.5 text-xs text-foreground">
                  Brasília
                </span>
              </div>
            </div>
            <FeeTable rows={bsbTable} />
          </CardContent>
        </Card>

        {/* SP */}
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="border-b border-border bg-muted/40 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 font-serif text-xl font-normal text-foreground">
                  <MapPin strokeWidth={1.5} className="h-5 w-5 text-primary" />
                  São Paulo
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Aplicável à unidade de SP
                </CardDescription>
              </div>
              <span className="rounded-md border border-primary/20 bg-primary/5 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-primary">
                SP
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Unidades incluídas
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="rounded border border-border bg-muted/40 px-2 py-0.5 text-xs text-foreground">
                  São Paulo
                </span>
              </div>
            </div>
            <FeeTable rows={spTable} />
          </CardContent>
        </Card>
      </div>

      <Card className="border-accent/30 bg-accent/5">
        <CardContent className="flex items-start gap-3 p-4">
          <DollarSign strokeWidth={1.5} className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
          <div className="space-y-1 text-sm">
            <p className="font-medium text-foreground">Como funciona o cálculo</p>
            <p className="text-muted-foreground">
              A faixa é determinada pela distância real da rota (não em linha reta). Use a calculadora para obter o
              valor exato considerando o endereço de destino.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
