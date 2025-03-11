import { Badge } from "@mui/material";
import PioreactorIcon from "./PioreactorIcon"; // Adjust the import path as needed

const PioreactorIconWithModel = ({ model }) => {
  const badgeContent = model === "pioreactor_40ml" ? "40" : "20";

  return (
    <Badge
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      sx={{
        display: { xs: "none", sm: "none", md: "inline" },
        marginRight: "8px",
        "& .MuiBadge-badge": {
          color: "inherit",
          backgroundColor: "white",
          border: "0.20em solid rgba(0, 0, 0, 0.87)",
          borderColor: "inherit",
          padding: "0px",
          fontSize: "8px",
          fontWeight: "900",
          height: "16px",
          minWidth: "16px",
          borderRadius: "8px",
          top: "12%",
          right: "24%",
        },
      }}
      max="9999"
      badgeContent={badgeContent}
      overlap="circular"
      color="primary"
    >
      <PioreactorIcon
        style={{ verticalAlign: "middle" }}
        sx={{ display: { xs: "none", sm: "none", md: "inline" } }}
      />
    </Badge>
  );
};

export default PioreactorIconWithModel;