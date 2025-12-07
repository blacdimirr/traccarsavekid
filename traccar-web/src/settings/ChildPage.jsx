import { useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import {
  Accordion, AccordionSummary, AccordionDetails, Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditItemView from './components/EditItemView';
import { useTranslation } from '../common/components/LocalizationProvider';
import SettingsMenu from './components/SettingsMenu';
import useSettingsStyles from './common/useSettingsStyles';
import SelectField from '../common/components/SelectField';

const ChildPage = () => {
  const { classes } = useSettingsStyles();
  const t = useTranslation();

  const [item, setItem] = useState();

  useEffect(() => {
    if (item && !item.baseHealth) {
      setItem({ ...item, baseHealth: {} });
    }
  }, [item]);

  const validate = () => item && item.name && item.lastName;

  const dateValue = (value) => (value ? value.substring(0, 10) : '');

  return (
    <EditItemView
      endpoint="savekid/children"
      item={item}
      setItem={setItem}
      defaultItem={{ baseHealth: {} }}
      validate={validate}
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'savekidChild']}
    >
      {item && (
        <>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">
                {t('sharedRequired')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
              <TextField
                value={item.name || ''}
                onChange={(event) => setItem({ ...item, name: event.target.value })}
                label={t('sharedFirstName')}
              />
              <TextField
                value={item.lastName || ''}
                onChange={(event) => setItem({ ...item, lastName: event.target.value })}
                label={t('sharedLastName')}
              />
              <TextField
                type="date"
                value={dateValue(item.birthDate)}
                onChange={(event) => setItem({ ...item, birthDate: event.target.value ? `${event.target.value}T00:00:00Z` : null })}
                label={t('savekidBirthDate')}
                InputLabelProps={{ shrink: true }}
              />
              <SelectField
                value={item.deviceId || null}
                onChange={(event) => setItem({ ...item, deviceId: event.target.value || null })}
                endpoint="/api/devices"
                label={t('deviceTitle')}
                emptyTitle={t('sharedNone')}
                fullWidth
              />
            </AccordionDetails>
          </Accordion>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">
                {t('sharedOptional')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
              <TextField
                type="number"
                value={item.height || ''}
                onChange={(event) => setItem({ ...item, height: event.target.value ? Number(event.target.value) : null })}
                label={t('savekidHeight')}
              />
              <TextField
                type="number"
                value={item.weight || ''}
                onChange={(event) => setItem({ ...item, weight: event.target.value ? Number(event.target.value) : null })}
                label={t('savekidWeight')}
              />
              <TextField
                multiline
                minRows={3}
                value={item.conditions || ''}
                onChange={(event) => setItem({ ...item, conditions: event.target.value })}
                label={t('savekidConditions')}
              />
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">
                {t('savekidBaseHealth')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
              <TextField
                type="number"
                value={item.baseHealth?.heartRate || ''}
                onChange={(event) => setItem({ ...item, baseHealth: { ...item.baseHealth, heartRate: event.target.value ? Number(event.target.value) : null } })}
                label={t('savekidHeartRate')}
              />
              <TextField
                type="number"
                value={item.baseHealth?.temperature || ''}
                onChange={(event) => setItem({ ...item, baseHealth: { ...item.baseHealth, temperature: event.target.value ? Number(event.target.value) : null } })}
                label={t('savekidTemperature')}
              />
              <TextField
                type="number"
                value={item.baseHealth?.steps || ''}
                onChange={(event) => setItem({ ...item, baseHealth: { ...item.baseHealth, steps: event.target.value ? Number(event.target.value) : null } })}
                label={t('savekidSteps')}
              />
              <TextField
                type="number"
                value={item.baseHealth?.sleep || ''}
                onChange={(event) => setItem({ ...item, baseHealth: { ...item.baseHealth, sleep: event.target.value ? Number(event.target.value) : null } })}
                label={t('savekidSleep')}
              />
            </AccordionDetails>
          </Accordion>
        </>
      )}
    </EditItemView>
  );
};

export default ChildPage;
