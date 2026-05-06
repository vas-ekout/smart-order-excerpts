import { useState } from 'react';

import { useMutation } from '@connectrpc/connect-query';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { ChecklistLabel } from '@cubular/core';
import { Icon } from '@cubular/icons';

import { DeviceService } from '../../api/proto/hygienepb/device_service_pb';
import { ChecklistTemplateItem } from '../../api/proto/hygienepb/shared_messages_pb';

interface DeviceChecklistItemProps {
  checklistItem: ChecklistTemplateItem;
  index: number;
  onMutationSuccess?: () => void;
}

export const DeviceChecklistItem = ({ checklistItem, index, onMutationSuccess }: DeviceChecklistItemProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [key, setKey] = useState(checklistItem.question);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: checklistItem.id,
  });

  const { t } = useTranslation();

  const { mutate: deleteChecklistItem } = useMutation(DeviceService.method.deleteChecklistItem, {
    onSuccess: () => onMutationSuccess?.(),
  });
  const { mutate: updateChecklistItem, mutateAsync: updateAsyncChecklistItem } = useMutation(
    DeviceService.method.updateChecklistItem,
    { onSuccess: () => onMutationSuccess?.() }
  );

  const handleDeleteChecklistItem = () => {
    deleteChecklistItem({ itemId: checklistItem.id });
  };

  const handleUpdateIsMandatory = () => {
    updateChecklistItem({
      itemId: checklistItem.id,
      question: checklistItem.question,
      isMandatory: !checklistItem.isMandatory,
    });
  };

  return (
    <Box
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      sx={{
        p: 2,
        bgcolor: 'grey.200',
        borderRadius: 1,
        display: 'flex',
        gap: 1.5,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <IconButton
        {...attributes}
        {...listeners}
        size="small"
        sx={{ cursor: 'grab', '&:active': { cursor: 'grabbing' }, p: 0 }}
      >
        <Icon icon="grip-vertical" variant="solid" color="text.primary" />
      </IconButton>
      <Typography color="text.primary" fontWeight={700}>
        {index + 1}
      </Typography>
      <Box sx={{ width: '100%', pt: '5px' }}>
        <ChecklistLabel
          forceEdit
          label={checklistItem.question}
          onChange={(label: string) =>
            updateAsyncChecklistItem({ itemId: checklistItem.id, question: label })
          }
        />
      </Box>

      <Box sx={{ ml: 'auto', display: 'flex', gap: 0.5, alignItems: 'center' }}>
        <Tooltip
          title={
            checklistItem.isMandatory
              ? t('sections.reprocessingDevices.deviceApprovalReqYes')
              : t('sections.reprocessingDevices.deviceApprovalReqNotYes')
          }
        >
          <IconButton
            onClick={handleUpdateIsMandatory}
            size="small"
            sx={{
              backgroundColor: checklistItem.isMandatory ? 'success.dark' : 'neutral.light',
              ':hover': {
                backgroundColor: checklistItem.isMandatory ? 'success.darker' : 'neutral.dark',
              },
            }}
          >
            <Icon icon="circle-check" color="background.default" variant="solid" size="s" />
          </IconButton>
        </Tooltip>
        <Tooltip title={t('sections.reprocessingDevices.deleteChecklistItem')}>
          <IconButton onClick={handleDeleteChecklistItem}>
            <Icon icon="trash-can" variant="solid" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};
