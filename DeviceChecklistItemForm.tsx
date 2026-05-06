import { useState } from 'react';

import { useMutation } from '@connectrpc/connect-query';
import { Box, Button, Collapse, IconButton, Tooltip, Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { AddFab } from '@cubular/core';
import { Form, FormTextField, HorizontalStack } from '@cubular/form';
import { Icon } from '@cubular/icons';
import { FormSubmitButton } from '@cubular/smartorder';

import {
  AddChecklistItemRequest,
  DeviceService,
} from '../../api/proto/hygienepb/device_service_pb';

interface DeviceChecklistItemFormProps {
  checklistId: string;
  onSuccess?: () => void;
}

export const DeviceChecklistItemForm = ({ checklistId, onSuccess }: DeviceChecklistItemFormProps) => {
  const [addingChecklistItem, setAddingChecklistItem] = useState(false);

  const { t } = useTranslation();

  const defaultValues = {
    question: '',
    isMandatory: false,
  };

  const methods = useForm({ defaultValues });

  const { mutate: addChecklistItem } = useMutation(DeviceService.method.addChecklistItem, {
    onSuccess: () => {
      methods.reset(defaultValues);
      setAddingChecklistItem(false);
      onSuccess?.();
    },
  });

  const {
    formState: { isDirty },
  } = methods;

  const handleSubmit = async (formData: typeof defaultValues) => {
    const deviceChecklistItem: AddChecklistItemRequest = {
      $typeName: 'hygiene.AddChecklistItemRequest',
      checklistId: checklistId,
      question: formData.question,
      isMandatory: formData.isMandatory,
    };
    addChecklistItem(deviceChecklistItem);
  };

  const handleAbort = () => {
    setAddingChecklistItem(false);
    if (isDirty) setTimeout(() => methods.reset(defaultValues), 500);
  };

  return (
    <Box sx={{ width: '100%', borderRadius: 1, bgcolor: 'primary.lighter', minHeight: 64, p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <AddFab onClick={() => setAddingChecklistItem(true)} />
        <Typography fontWeight={700} color="primary.main">
          {t('sections.reprocessingDevices.addChecklistItem')}
        </Typography>
      </Box>
      <Collapse in={addingChecklistItem} timeout="auto" unmountOnExit>
        <Form methods={methods} onSubmit={handleSubmit} sx={{ border: '0px solid red', mt: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormTextField size="medium" label={t('admin.checklists.name')} name="question" />
            <Box sx={{ alignContent: 'center' }}>
              <Controller
                name="isMandatory"
                control={methods.control}
                render={({ field }) => (
                  <Tooltip
                    title={
                      field.value
                        ? t('sections.reprocessingDevices.deviceApprovalReqYes')
                        : t('sections.reprocessingDevices.deviceApprovalReqNotYes')
                    }
                  >
                    <IconButton
                      size="medium"
                      onClick={() => field.onChange(!field.value)}
                      sx={{
                        backgroundColor: field.value ? 'success.dark' : 'neutral.light',
                        borderRadius: 1,
                        height: '100%',
                        width: 53.13,
                        ':hover': {
                          backgroundColor: field.value ? 'success.darker' : 'neutral.dark',
                        },
                      }}
                    >
                      <Icon
                        icon="circle-check"
                        color="background.default"
                        variant="solid"
                        size="l"
                      />
                    </IconButton>
                  </Tooltip>
                )}
              />
            </Box>
          </Box>
          <HorizontalStack justifyContent="flex-end" marginTop={2} spacing={1}>
            <Button variant="outlined" size="small" sx={{ px: 4 }} onClick={handleAbort}>
              {t('common.cancel')}
            </Button>
            <FormSubmitButton variant="contained" size="small" sx={{ px: 4 }} disabled={!isDirty}>
              {t('common.save')}
            </FormSubmitButton>
          </HorizontalStack>
        </Form>
      </Collapse>
    </Box>
  );
};
