import * as React from 'react';
import Container from '@mui/material/Container';
import ClearLampTable from '@/view/components/table/table';

const AAATable: React.FC = () => {
  return (
    <Container fixed className="commonLayout">
      <ClearLampTable />
    </Container>
  );
}

export default AAATable;
