import React, { useEffect, useState } from "react";
import Container from "@mui/material/Container";
import SyncLoginScreen from "../sync/login";
import fbActions from "@/components/firebase/actions";
import Loader from "../common/loader";
import ControlTab from "./control";

interface S {
  isLoading: boolean;
  isError: boolean;
  userData: any;
}

const SyncSettings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    new fbActions().auth().onAuthStateChanged((user: any) => {
      setUserData(user);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <Loader hasMargin />;
  }
  return (
    <Container fixed className="commonLayout">
      {!userData && <SyncLoginScreen mode={0} />}
      {userData && <ControlTab userData={userData} />}
    </Container>
  );
};

export default SyncSettings;
