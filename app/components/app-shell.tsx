"use client"

import { useState } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Calculator, MapPin, Bike, Table2 } from "lucide-react"
import DeliveryCalculator from "./delivery-calculator"
import StoreLocator from "./store-locator"
import PricingTable from "./pricing-table"

type ViewKey = "calculator" | "locator" | "pricing"

const navItems: Array<{
  key: ViewKey
  label: string
  description: string
  icon: typeof Calculator
}> = [
  {
    key: "calculator",
    label: "Calculadora de Frete",
    description: "Distância, rota e taxa",
    icon: Calculator,
  },
  {
    key: "locator",
    label: "Identificar Loja",
    description: "Áreas de cobertura",
    icon: MapPin,
  },
  {
    key: "pricing",
    label: "Tabela de Fretes",
    description: "Preços por faixa",
    icon: Table2,
  },
]

export default function AppShell() {
  const [activeView, setActiveView] = useState<ViewKey>("calculator")

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="border-r border-sidebar-border">
        <SidebarHeader className="border-b border-sidebar-border">
          <div className="flex items-center gap-3 px-2 py-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <Bike strokeWidth={1.75} className="h-5 w-5" />
            </div>
            <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
              <span className="font-serif text-lg leading-none text-sidebar-foreground">FreteGuru</span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-sidebar-foreground/60">
                delivery
              </span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden">
              Navegação
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = activeView === item.key
                  return (
                    <SidebarMenuItem key={item.key}>
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={item.label}
                        onClick={() => setActiveView(item.key)}
                        size="lg"
                        className="data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground data-[active=true]:hover:bg-sidebar-primary data-[active=true]:hover:text-sidebar-primary-foreground group-data-[collapsible=icon]:!h-10 group-data-[collapsible=icon]:!w-10 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:justify-center"
                      >
                        <Icon strokeWidth={1.75} />
                        <div className="flex flex-col items-start overflow-hidden group-data-[collapsible=icon]:hidden">
                          <span className="text-sm font-medium leading-tight">{item.label}</span>
                          <span className="text-[11px] leading-tight opacity-70">{item.description}</span>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border">
          <div className="flex items-center justify-between gap-2 px-2 py-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
            <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
              <p className="font-mono text-[10px] uppercase tracking-widest text-sidebar-foreground/50">
                versão
              </p>
              <p className="font-mono text-xs text-sidebar-foreground/80">2026.04</p>
            </div>
            <SidebarTrigger className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" />
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="bg-background">
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-6xl">
            {activeView === "calculator" && <DeliveryCalculator />}
            {activeView === "locator" && <StoreLocator />}
            {activeView === "pricing" && <PricingTable />}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
