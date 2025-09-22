import type { Meta, StoryObj } from "@storybook/react";
import { RelatedNews } from "@smbc/mui-components";
import type { NewsItem } from "@smbc/mui-components";

const meta: Meta<typeof RelatedNews> = {
  title: "Components/RelatedNews",
  component: RelatedNews,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockNewsItems: NewsItem[] = [
  {
    id: "1",
    title: "Sandy Tong: S.F.'s first Asian fire chief - and first without fire...",
    date: "06-Sep",
    author: "Yujie Zhou",
    source: "News Source",
    imageUrl: "https://picsum.photos/38/38?random=1",
    externalUrl: "https://example.com/news/1",
    readingProgress: 70,
  },
  {
    id: "2",
    title: "Election Results 2025: See results across San Francisco",
    date: "05-Sep",
    author: "News Team",
    source: "City Herald",
    imageUrl: "https://picsum.photos/38/38?random=2",
    externalUrl: "https://example.com/news/2",
    readingProgress: 45,
  },
  {
    id: "3",
    title: "Homeless people often choose the street over a bed. We look...",
    date: "04-Sep",
    author: "Reporter",
    source: "Daily Times",
    imageUrl: "https://picsum.photos/38/38?random=3",
    externalUrl: "https://example.com/news/3",
    readingProgress: 90,
  },
  {
    id: "4",
    title: "Auto Towing owners accused of buying Lamborghini while...",
    date: "03-Sep",
    author: "Business Desk",
    source: "Finance Weekly",
    externalUrl: "https://example.com/news/4",
    readingProgress: 25,
  },
  {
    id: "5",
    title: "San Francisco Harley-Davidson closes abruptly after 110 Years in...",
    date: "02-Sep",
    author: "Auto Reporter",
    source: "Motor News",
    imageUrl: "https://picsum.photos/38/38?random=5",
    externalUrl: "https://example.com/news/5",
    readingProgress: 60,
  },
];

export const Default: Story = {
  args: {
    items: mockNewsItems,
    onItemClick: (item) => console.log("Clicked item:", item),
  },
};

export const WithoutProgress: Story = {
  args: {
    items: mockNewsItems.map(item => ({ ...item, readingProgress: undefined })),
    onItemClick: (item) => console.log("Clicked item:", item),
  },
};

export const WithoutExternalLinks: Story = {
  args: {
    items: mockNewsItems.map(item => ({ ...item, externalUrl: undefined })),
    onItemClick: (item) => console.log("Clicked item:", item),
  },
};