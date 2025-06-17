import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ScrollView,
  Modal,
  Platform,
} from 'react-native';
import React, {useEffect, useState, useCallback, useRef} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import NormalHeader from '../../Components/UI/NormalHeader';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {
  getCashbackListThunk,
  getReferralListThunk,
} from '../../Redux/Reducers/ReferralReducer/ReferralListSlice';
import {Images} from '../../Config';
import {COLOR, Matrics, typography} from '../../Config/AppStyling';
import i18n from '../../i18n/i18n';

const Cashback = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {cashbackList, isLoading, error, referralList} = useSelector(
    state => state.referralList,
  );
  console.log('cashbackList', cashbackList);
  console.log('referralList', referralList);

  // Local state
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentFilter, setCurrentFilter] = useState('All');
  const [currentFilterType, setCurrentFilterType] = useState(null);
  const hasInitialized = useRef(false);
  const limit = 10;

  const filterOptions = [
    {label: i18n.t('Cashback.all'), value: 'All', type: null},
    {label: i18n.t('Cashback.hotel'), value: 'Hotel', type: 'HOTEL'},
    {label: i18n.t('Cashback.cars'), value: 'Cars', type: 'CARS'},
    {label: i18n.t('Cashback.flights'), value: 'Flights', type: 'FLIGHTS'},
    {label: i18n.t('Cashback.tours'), value: 'Tours', type: 'TOURS'},
  ];

  const formatDate = dateString => {
    if (!dateString) {
      return 'N/A';
    }

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const getBookingTypeIcon = type => {
    console.log('Type', type.toLowerCase());
    switch (type?.toLowerCase()) {
      case 'flight':
        return Images.FLIGHT_ICON;
      case 'hotel':
        return Images.HOTELS_ACTIVE;
      case 'car':
        return Images.CAR_ICON;
      case 'bus':
        return Images.BUS_ICON;
      default:
        return Images.FLIGHT_ICON;
    }
  };

  const loadCashback = useCallback(
    async (page = 1, type = null) => {
      try {
        const params = {pageCount: page, limit: limit};
        if (type) {
          params.type = type;
        }
        await dispatch(getCashbackListThunk(params));
        const thunkParams = {
          pageCount: page,
          limit: limit,
          statusType: null,
          isNewFilter: false,
        };

        await dispatch(getReferralListThunk(thunkParams)).unwrap();
      } catch (err) {
        console.error('Error loading cashback:', err);
      } finally {
        setIsLoadingMore(false);
      }
    },
    [dispatch],
  );

  const handleFilterSelect = selectedFilter => {
    setShowDropdown(false);

    const filterOption = filterOptions.find(
      option => option.value === selectedFilter,
    );
    const filterType = filterOption ? filterOption.type : null;

    if (selectedFilter !== currentFilter) {
      setCurrentFilter(selectedFilter);
      setCurrentFilterType(filterType);

      hasInitialized.current = false;
      loadCashback(1, filterType);
    }
  };

  // Initial load with cleanup
  useFocusEffect(
    useCallback(() => {
      let isCancelled = false;

      const loadInitialData = async () => {
        if (!isCancelled && !hasInitialized.current) {
          hasInitialized.current = true;
          await loadCashback(1);
        }
      };

      loadInitialData();

      return () => {
        isCancelled = true;
        hasInitialized.current = false;
      };
    }, [loadCashback]),
  );

  const renderDropdown = () => (
    <Modal
      transparent={true}
      visible={showDropdown}
      animationType="fade"
      onRequestClose={() => setShowDropdown(false)}>
      <TouchableOpacity
        style={styles.dropdownOverlay}
        activeOpacity={1}
        onPress={() => setShowDropdown(false)}>
        <View style={styles.dropdownContainer}>
          {filterOptions.map((option, index) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.dropdownItem,
                index === 0 && styles.dropdownItemFirst,
                index === filterOptions.length - 1 && styles.dropdownItemLast,
                currentFilter === option.value && styles.selectedDropdownItem,
              ]}
              onPress={() => handleFilterSelect(option.value)}>
              <Text
                style={[
                  styles.dropdownItemText,
                  currentFilter === option.value &&
                    styles.selectedDropdownItemText,
                ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const renderTableHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={[styles.headerText, {width: 40}]}>#</Text>
      <Text style={[styles.headerText, {width: 120}]}>
        {i18n.t('Cashback.date')}
      </Text>
      <Text style={[styles.headerText, {width: 60, textAlign: 'center'}]}>
        {i18n.t('Cashback.type')}
      </Text>
      <Text style={[styles.headerText, {width: 100, textAlign: 'right'}]}>
        {i18n.t('Cashback.amount')}
      </Text>
      <Text style={[styles.headerText, {width: 100, textAlign: 'right'}]}>
        {i18n.t('Cashback.cashback')}
      </Text>
    </View>
  );

  const renderFixedHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerTitleContainer}>
        <Text style={styles.headerTitle}>{i18n.t('Cashback.tableTitle')}</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowDropdown(true)}>
          <Text style={styles.filterText}>{currentFilter}</Text>
          <Image
            source={Images.DOWN_ARROW_GRAY}
            style={{
              width: Matrics.s(14),
              height: Matrics.s(14),
            }}
            resizeMethod="contain"
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderRow = ({item, index}) => {
    console.log('Item', item);
    return (
      <View style={[styles.tableRow, index % 2 === 0 && styles.evenRow]}>
        <Text style={[styles.cellText, {width: 40}]}>{index + 1}</Text>
        <Text style={[styles.cellText, {width: 120}]}>
          {formatDate(item.OrderDate)}
        </Text>
        <View
          style={{width: 60, alignItems: 'center', justifyContent: 'center'}}>
          <Image
            source={getBookingTypeIcon(item.from)}
            style={{width: 20, height: 20}}
            resizeMethod="contain"
          />
        </View>
        <Text
          style={[
            styles.cellText,
            styles.amountText,
            {width: 100, textAlign: 'right'},
          ]}>
          ${Number(item?.total_amount).toFixed(2) || '0.00'}
        </Text>
        <Text
          style={[
            styles.cellText,
            styles.cashbackText,
            {width: 100, textAlign: 'right'},
          ]}>
          ${Number(item?.amount).toFixed(2) || '0.00'}
        </Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (!isLoadingMore) return null;

    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={COLOR.PRIMARY} />
        <Text style={styles.loadingText}>Loading more...</Text>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>No cashback found</Text>
      <Text style={styles.emptySubtext}>
        You haven't earned any cashback yet
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorState}>
      <Text style={styles.errorText}>{error}</Text>
    </View>
  );

  const renderContent = () => (
    <>
      <ScrollView>
        <NormalHeader
          title={i18n.t('Cashback.cashbackTitle')}
          showLeftButton={false}
          showRightButton={true}
          rightIconName={i18n.t('Cashback.rightMenu')}
          rightIconFonSize={Matrics.s(10)}
          onCheckPress={() => {
            navigation.navigate('Referral');
          }}
        />
        <View
          style={{
            marginTop: Matrics.vs(16),
            paddingHorizontal: Matrics.s(6),
          }}>
          <View
            style={{
              backgroundColor: COLOR.PRIMARY,
              padding: Matrics.s(12),
              borderRadius: Matrics.s(12),
              justifyContent: 'center',
              alignItems: 'center',
              paddingVertical: Matrics.vs(16),
              width: '50%',
              alignSelf: 'center',
            }}>
            <Image source={Images.WALLET} style={{width: 30, height: 30}} />
            <Text
              style={{
                color: COLOR.WHITE,
                fontFamily: typography.fontFamily.Montserrat.Bold,
                fontSize: typography.fontSizes.fs30,
                marginTop: Matrics.vs(8),
              }}>
              $
              {Number(
                cashbackList?.total_cashback + referralList?.data?.total_amount,
              ).toFixed(2)}
            </Text>
          </View>
        </View>
        {/* Cashback Summary Cards */}
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: Matrics.s(6),
            marginTop: Matrics.vs(8),
          }}>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'space-between',
              borderWidth: 1,
              borderColor: COLOR.PRIMARY,
              paddingHorizontal: Matrics.s(12),
              paddingVertical: Matrics.vs(16),
              borderRadius: Matrics.s(12),
              marginVertical: Matrics.vs(16),
              backgroundColor: COLOR.WHITE,
              boxShadow: '0 4px 8px 0 rgba(139, 92, 246, 0.15)',
            }}>
            <View style={{flex: 1, alignItems: 'center'}}>
              <Text
                style={{
                  fontSize: Matrics.s(12),
                  fontFamily: typography.fontFamily.Montserrat.Regular,
                  color: COLOR.PRIMARY,
                }}>
                {i18n.t('Cashback.totalCashback')}
              </Text>
              <Text
                style={{
                  fontSize: Matrics.s(26),
                  fontFamily: typography.fontFamily.Montserrat.Bold,
                  color: COLOR.PRIMARY,
                }}>
                ${Number(cashbackList?.total_cashback).toFixed(2) || '0.00'}
              </Text>
            </View>
            <View
              style={{
                alignSelf: 'flex-end',
              }}>
              <Image
                source={Images.MONEY_MONEY}
                style={{width: 30, height: 30}}
                resizeMethod="contain"
              />
            </View>
          </View>
        </View>

        {/* Cashback Table */}
        <View style={styles.container}>
          {/* Fixed Header - Not Scrollable */}
          {renderFixedHeader()}

          {error ? (
            renderErrorState()
          ) : (
            <ScrollView
              horizontal={true}
              showsHorizontalScrollIndicator={false}>
              <View style={styles.tableContainer}>
                <FlatList
                  data={cashbackList?.data || []}
                  renderItem={renderRow}
                  keyExtractor={(item, index) =>
                    `${item?.id || index}-${index}`
                  }
                  ListHeaderComponent={renderTableHeader}
                  ListFooterComponent={renderFooter}
                  ListEmptyComponent={!isLoading ? renderEmptyState : null}
                  showsVerticalScrollIndicator={false}
                  style={styles.table}
                  scrollEnabled={false}
                />
              </View>
            </ScrollView>
          )}
        </View>
      </ScrollView>
      {renderDropdown()}
    </>
  );

  return Platform.OS === 'android' ? (
    <SafeAreaView style={{flex: 1}}>{renderContent()}</SafeAreaView>
  ) : (
    <View style={{flex: 1}}>{renderContent()}</View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: Matrics.s(12),
    marginVertical: Matrics.vs(10),
  },
  headerContainer: {
    borderTopLeftRadius: Matrics.s(12),
    borderTopRightRadius: Matrics.s(12),
  },
  headerTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Matrics.s(16),
    paddingVertical: Matrics.vs(7),
    borderBottomWidth: 1,
    borderBottomColor: COLOR.BORDER_COLOR,
    backgroundColor: COLOR.WHITE,
  },
  headerTitle: {
    fontSize: Matrics.s(16),
    fontFamily: typography.fontFamily.Montserrat.Bold,
    color: COLOR.TITLE_COLOR,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Matrics.s(12),
    paddingVertical: Matrics.vs(8),
  },
  filterText: {
    fontSize: Matrics.s(14),
    fontFamily: typography.fontFamily.Montserrat.Medium,
    color: COLOR.TITLE_COLOR,
    marginRight: Matrics.s(8),
  },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: Matrics.s(16),
    paddingVertical: Matrics.vs(12),
    backgroundColor: COLOR.SMALL_CARD_BACKGROUND,
    width: 452,
  },
  headerText: {
    fontSize: Matrics.s(14),
    fontFamily: typography.fontFamily.Montserrat.Medium,
    color: COLOR.TITLE_COLOR,
  },
  table: {
    borderRadius: Matrics.s(12),
    width: 452,
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: Matrics.s(16),
    paddingVertical: Matrics.vs(16),
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLOR.BORDER_COLOR,
    width: 452,
  },
  evenRow: {
    backgroundColor: '#FAFAFA',
  },
  cellText: {
    fontSize: Matrics.s(14),
    fontFamily: typography.fontFamily.Montserrat.Regular,
    color: COLOR.TITLE_COLOR,
  },
  amountText: {
    fontFamily: typography.fontFamily.Montserrat.Medium,
    color: '#F7BD59',
  },
  cashbackText: {
    fontFamily: typography.fontFamily.Montserrat.Medium,
    color: COLOR.SUCCESS,
  },
  loadingFooter: {
    paddingVertical: Matrics.vs(20),
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loadingText: {
    marginLeft: Matrics.s(8),
    color: COLOR.DIM_TEXT_COLOR,
    fontSize: Matrics.s(14),
  },
  emptyState: {
    paddingVertical: Matrics.vs(40),
    alignItems: 'center',
  },
  emptyText: {
    fontSize: Matrics.s(16),
    fontFamily: typography.fontFamily.Montserrat.Medium,
    color: COLOR.TITLE_COLOR,
    marginBottom: Matrics.vs(8),
  },
  emptySubtext: {
    fontSize: Matrics.s(14),
    color: COLOR.DIM_TEXT_COLOR,
    textAlign: 'center',
  },
  errorState: {
    paddingVertical: Matrics.vs(40),
    alignItems: 'center',
  },
  errorText: {
    fontSize: Matrics.s(14),
    color: COLOR.DANGER,
    textAlign: 'center',
  },
  tableContainer: {
    minWidth: 452,
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    paddingTop: Matrics.vs(120),
    paddingHorizontal: Matrics.s(16),
  },
  dropdownContainer: {
    backgroundColor: COLOR.WHITE,
    borderRadius: Matrics.s(8),
    marginLeft: 'auto',
    marginRight: Matrics.s(16),
    marginTop: Matrics.vs(230),
    minWidth: Matrics.s(120),
    shadowColor: COLOR.BLACK,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  dropdownItem: {
    paddingHorizontal: Matrics.s(16),
    paddingVertical: Matrics.vs(12),
    borderBottomWidth: 1,
    borderBottomColor: COLOR.BORDER_COLOR,
  },
  dropdownItemFirst: {
    borderTopLeftRadius: Matrics.s(8),
    borderTopRightRadius: Matrics.s(8),
  },
  dropdownItemLast: {
    borderBottomWidth: 0,
    borderBottomLeftRadius: Matrics.s(8),
    borderBottomRightRadius: Matrics.s(8),
  },
  selectedDropdownItem: {
    backgroundColor: COLOR.PRIMARY,
  },
  dropdownItemText: {
    fontSize: Matrics.s(14),
    fontFamily: typography.fontFamily.Montserrat.Regular,
    color: COLOR.TITLE_COLOR,
  },
  selectedDropdownItemText: {
    color: COLOR.WHITE,
    fontFamily: typography.fontFamily.Montserrat.Medium,
  },
});

export default Cashback;
