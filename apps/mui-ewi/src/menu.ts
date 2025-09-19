export const navigation = [
  { label: "Events Dashboard", type: "link" as const, href: "/events" },
  {
    label: "Obligor Dashboard",
    type: "link" as const,
    href: "/obligor-dashboard",
  },
  {
    label: "Subscription Managers",
    type: "link" as const,
    href: "/subscription-managers",
  },
  {
    label: "Reporting",
    type: "dropdown" as const,
    items: [{ label: "Usage Stats", href: "/usage-stats" }],
  },
  {
    label: "Quick Guide",
    type: "button" as const,
    color: "primary" as const,
  },
];