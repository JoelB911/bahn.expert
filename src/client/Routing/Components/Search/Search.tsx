import {
  addDays,
  endOfDay,
  isSameDay,
  isSameYear,
  isWithinInterval,
  lightFormat,
  startOfDay,
  subDays,
} from 'date-fns';
import { connect, ResolveThunks } from 'react-redux';
import { DateTimePicker } from '@material-ui/pickers';
import { getRoutes } from 'Routing/actions/routing';
import { Route } from 'types/routing';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { RoutingState } from 'AppState';
import { Station } from 'types/station';
import { StationSearchType } from 'Common/config';
import Button from '@material-ui/core/Button';
import deLocale from 'date-fns/locale/de';
import IconButton from '@material-ui/core/IconButton';
import React, { SyntheticEvent, useCallback, useEffect } from 'react';
import searchActions, { getStationById } from 'Routing/actions/search';
import StationSearch from 'Common/Components/StationSearch';
import SwapVertical from '@material-ui/icons/SwapVert';
import useStyles from './Search.styles';

type DispatchProps = ResolveThunks<{
  getStationById: typeof getStationById;
  setStart: typeof searchActions.setStart;
  setDestination: typeof searchActions.setDestination;
  getRoutes: typeof getRoutes;
  setDate: typeof searchActions.setDate;
}>;
type StateProps = {
  start?: Station;
  destination?: Station;
  date: Date;
  routes: Route[];
  dateTouched?: boolean;
};
type ReduxProps = DispatchProps & StateProps;
type Props = ReduxProps &
  RouteComponentProps<{
    start?: string;
    destination?: string;
  }>;

const formatDate = (date: null | Date) => {
  if (!date) {
    return '';
  }
  const today = startOfDay(new Date());
  const tomorrow = endOfDay(addDays(today, 1));
  const yesterday = subDays(today, 1);

  let relativeDayString = '';

  if (isWithinInterval(date, { start: yesterday, end: tomorrow })) {
    if (isSameDay(date, today)) relativeDayString = 'Heute';
    else if (isSameDay(date, yesterday)) relativeDayString = 'Gestern';
    else if (isSameDay(date, tomorrow)) relativeDayString = 'Morgen';
    relativeDayString += `, ${deLocale.localize.day(date.getDay(), {
      width: 'short',
    })}`;
  } else {
    relativeDayString = deLocale.localize.day(date.getDay());
  }
  relativeDayString += ` ${lightFormat(date, 'dd.MM.')}`;
  if (!isSameYear(date, today)) {
    relativeDayString += lightFormat(date, 'yyyy');
  }
  relativeDayString += ` ${lightFormat(date, 'HH:mm')}`;

  return relativeDayString;
};

const Search = ({
  start,
  destination,
  setStart,
  setDestination,
  date,
  setDate,
  match,
  routes,
  getStationById,
  history,
  getRoutes,
  dateTouched,
}: Props) => {
  const classes = useStyles();

  useEffect(() => {
    const { start, destination } = match.params;

    if (start) {
      getStationById(start, searchActions.setStart);
    }
    if (destination) {
      getStationById(destination, searchActions.setDestination);
    }
    if (!routes.length && !dateTouched) {
      setDate(new Date(), false);
    }
  }, [dateTouched, getStationById, match.params, routes.length, setDate]);

  const searchRoute = useCallback(
    (e: SyntheticEvent) => {
      e.preventDefault();

      if (start && destination) {
        getRoutes(start.id, destination.id, date);
        history.push(`/routing/${start.id}/${destination.id}`);
      }
    },
    [date, destination, getRoutes, history, start]
  );
  const goHome = useCallback(() => {
    history.push('/');
  }, [history]);

  return (
    <>
      <StationSearch
        searchType={StationSearchType.DBNavgiator}
        value={start}
        onChange={setStart}
        placeholder="Start"
      />
      <div className={classes.destination}>
        <StationSearch
          searchType={StationSearchType.DBNavgiator}
          value={destination}
          onChange={setDestination}
          placeholder="Destination"
        />
        <IconButton
          style={{ padding: 0 }}
          onClick={(e: SyntheticEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setDestination(start);
            setStart(destination);
          }}
        >
          <SwapVertical fontSize="large" />
        </IconButton>
      </div>
      <DateTimePicker
        fullWidth
        openTo="hours"
        className={classes.datePicker}
        labelFunc={formatDate}
        ampm={false}
        showTodayButton
        value={date}
        onChange={setDate}
        cancelLabel="Abbrechen"
        autoOk
        todayLabel="Jetzt"
        minutesStep={5}
      />
      <div className={classes.buttons}>
        <Button fullWidth variant="contained" onClick={searchRoute}>
          Search
        </Button>
        <Button variant="contained" onClick={goHome}>
          Home
        </Button>
      </div>
    </>
  );
};
// }

export default connect<StateProps, DispatchProps, {}, RoutingState>(
  state => ({
    start: state.search.start,
    destination: state.search.destination,
    date: state.search.date,
    routes: state.routing.routes || [],
    dateTouched: state.search.dateTouched,
  }),
  {
    getStationById,
    setStart: searchActions.setStart,
    setDestination: searchActions.setDestination,
    getRoutes,
    setDate: searchActions.setDate,
  }
)(withRouter(Search));