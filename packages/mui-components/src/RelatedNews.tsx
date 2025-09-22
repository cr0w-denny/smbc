import React from "react";
import { Box, Typography, Avatar, IconButton } from "@mui/material";
import { OpenInNew as ExternalLinkIcon } from "@mui/icons-material";
import { styled } from "@mui/material/styles";

export interface NewsItem {
  id: string;
  title: string;
  date: string;
  author: string;
  source: string;
  imageUrl?: string;
  externalUrl?: string;
  readingProgress?: number; // 0-100 percentage
}

export interface RelatedNewsProps {
  items: NewsItem[];
  onItemClick?: (item: NewsItem) => void;
  sx?: any;
}

const NewsContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(0.125), // 1px gap
}));

const NewsItemContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  height: "56px",
  padding: theme.spacing(0, 2.5), // 20px left/right
  cursor: "pointer",
  borderBottom: `1px solid ${theme.palette.divider}`,
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
  "&:last-child": {
    borderBottom: "none",
  },
}));

const NewsImage = styled(Avatar)(({ theme }) => ({
  width: 38,
  height: 38,
  marginRight: theme.spacing(1.5),
  flexShrink: 0,
}));

const ContentArea = styled(Box)({
  flex: 1,
  minWidth: 0, // Allow text truncation
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
});

const TitleText = styled(Typography)(({ theme }) => ({
  fontSize: "15px",
  fontFamily: "Roboto",
  fontWeight: 500,
  color: "#486C94",
  lineHeight: 1.3,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  marginBottom: theme.spacing(0.25),
}));

const MetaText = styled(Typography)(({ theme }) => ({
  fontSize: "12px",
  color: theme.palette.mode === "light" ? "#1F3359" : theme.palette.text.secondary,
  lineHeight: 1.2,
}));


const ProgressRing = styled(Box)<{ progress: number }>(({ progress, theme }) => {
  const radius = 9;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return {
    width: 24,
    height: 24,
    position: "relative",
    flexShrink: 0,
    "& svg": {
      width: "100%",
      height: "100%",
      transform: "rotate(-90deg)",
    },
    "& .progress-bg": {
      fill: "none",
      stroke: theme.palette.mode === "light" ? "#E3EBF2" : "#2A3A4A",
      strokeWidth: 3,
    },
    "& .progress-fill": {
      fill: "none",
      stroke: "#12A187",
      strokeWidth: 3,
      strokeLinecap: "round",
      strokeDasharray,
      strokeDashoffset,
      transition: "stroke-dashoffset 0.3s ease",
    },
  };
});

const GoogleText = styled(Typography)(({ theme }) => ({
  fontSize: "12px",
  color: theme.palette.mode === "light" ? "#474747" : theme.palette.text.secondary,
  marginLeft: theme.spacing(0.5),
  flexShrink: 0,
}));

const ExternalLinkButton = styled(IconButton)(({ theme }) => ({
  padding: theme.spacing(0.25),
  color: theme.palette.mode === "light" ? "#486C94" : theme.palette.action.active,
  transform: "translateY(-2px)",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
  "& .MuiSvgIcon-root": {
    fontSize: "14px",
  },
}));

const NewsItemComponent: React.FC<{
  item: NewsItem;
  onClick?: (item: NewsItem) => void;
}> = ({ item, onClick }) => {
  const handleClick = () => {
    onClick?.(item);
  };

  const handleExternalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.externalUrl) {
      window.open(item.externalUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <NewsItemContainer onClick={handleClick}>
      <NewsImage
        src={item.imageUrl}
        alt={item.title}
        sx={{
          "& .MuiAvatar-img": {
            objectFit: "cover",
          },
        }}
      >
        {!item.imageUrl && item.title.charAt(0).toUpperCase()}
      </NewsImage>

      <ContentArea>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <TitleText>{item.title}</TitleText>
          {item.externalUrl && (
            <ExternalLinkButton
              onClick={handleExternalClick}
              aria-label="Open in new tab"
              sx={{ padding: 0, minWidth: "auto" }}
            >
              <ExternalLinkIcon />
            </ExternalLinkButton>
          )}
        </Box>
        <MetaText>
          {item.date} {item.author}
        </MetaText>
      </ContentArea>

      {item.readingProgress !== undefined && (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <ProgressRing progress={item.readingProgress}>
            <svg>
              <circle
                className="progress-bg"
                cx="12"
                cy="12"
                r="9"
              />
              <circle
                className="progress-fill"
                cx="12"
                cy="12"
                r="9"
              />
            </svg>
          </ProgressRing>
          <GoogleText>Google: {item.readingProgress}%</GoogleText>
        </Box>
      )}
    </NewsItemContainer>
  );
};

export const RelatedNews: React.FC<RelatedNewsProps> = ({
  items,
  onItemClick,
  sx,
}) => {
  return (
    <NewsContainer sx={sx}>
      {items.map((item) => (
        <NewsItemComponent
          key={item.id}
          item={item}
          onClick={onItemClick}
        />
      ))}
    </NewsContainer>
  );
};