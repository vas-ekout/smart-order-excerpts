import { IconButton } from '@mui/material';

import { BadgeStatus } from '@cubular/core';
import { Icon } from '@cubular/icons';

interface ReprocessingDeviceListButtonProps {
  count?: number;
  open: boolean;
  onClick: () => void;
}

export const ReprocessingDeviceListButton = ({
  count,
  open,
  onClick,
}: ReprocessingDeviceListButtonProps) => {
  return (
    <IconButton onClick={onClick} sx={{ width: 36 }}>
      {!!count && (
        <BadgeStatus
          counter={count}
          sx={{ position: 'absolute', bgcolor: 'error.main', top: 0, right: 0 }}
        />
      )}
      <Icon color={open ? 'primary.main' : ''} icon="plug" size="l" variant="solid" />
    </IconButton>
  );
};
