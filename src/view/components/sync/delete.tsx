import fbActions from "@/components/firebase/actions";
import { useEffect, useMemo } from "react";
import { withRouter } from "react-router-dom";

const Page: React.FC = () => {
  const actions = useMemo(() => new fbActions(), []);
  useEffect(() => {});
  return null;
};

export default withRouter(Page);
