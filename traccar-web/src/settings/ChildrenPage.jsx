import { useMemo, useState } from 'react';
import {
  Table, TableRow, TableCell, TableHead, TableBody,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { useEffectAsync } from '../reactHelper';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import CollectionFab from './components/CollectionFab';
import CollectionActions from './components/CollectionActions';
import TableShimmer from '../common/components/TableShimmer';
import SearchHeader, { filterByKeyword } from './components/SearchHeader';
import useSettingsStyles from './common/useSettingsStyles';
import fetchOrThrow from '../common/util/fetchOrThrow';

const getAge = (birthDate) => {
  if (!birthDate) {
    return '';
  }
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) {
    return '';
  }
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDelta = now.getMonth() - birth.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
};

const ChildrenPage = () => {
  const { classes } = useSettingsStyles();
  const t = useTranslation();

  const [timestamp, setTimestamp] = useState(Date.now());
  const [items, setItems] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(false);

  const devices = useSelector((state) => state.devices.items);

  useEffectAsync(async () => {
    setLoading(true);
    try {
      const response = await fetchOrThrow('/api/savekid/children');
      setItems(await response.json());
    } finally {
      setLoading(false);
    }
  }, [timestamp]);

  const deviceLookup = useMemo(() => devices || {}, [devices]);

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'savekidChildren']}>
      <SearchHeader keyword={searchKeyword} setKeyword={setSearchKeyword} />
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell>{t('sharedFirstName')}</TableCell>
            <TableCell>{t('sharedLastName')}</TableCell>
            <TableCell>{t('savekidAge')}</TableCell>
            <TableCell>{t('deviceTitle')}</TableCell>
            <TableCell className={classes.columnAction} />
          </TableRow>
        </TableHead>
        <TableBody>
          {!loading ? items.filter(filterByKeyword(searchKeyword)).map((item) => {
            const age = getAge(item.birthDate);
            const deviceName = item.deviceId && deviceLookup[item.deviceId]
              ? deviceLookup[item.deviceId].name
              : t('sharedNone');
            return (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.lastName}</TableCell>
                <TableCell>{age !== '' ? age : '—'}</TableCell>
                <TableCell>{deviceName}</TableCell>
                <TableCell className={classes.columnAction} padding="none">
                  <CollectionActions itemId={item.id} editPath="/settings/child" endpoint="savekid/children" setTimestamp={setTimestamp} />
                </TableCell>
              </TableRow>
            );
          }) : (<TableShimmer columns={5} endAction />)}
        </TableBody>
      </Table>
      <CollectionFab editPath="/settings/child" />
    </PageLayout>
  );
};

export default ChildrenPage;
