// @flow
/* eslint max-len: 0 */
import './TraewellingLink.scss';
import { connect } from 'react-redux';
import React from 'react';
import type { Abfahrt } from 'types/abfahrten';
import type { AppState } from 'AppState';

type StateProps = {
  show: boolean,
};

type Props = StateProps & {
  abfahrt: Abfahrt,
};

function preventDefault(e: SyntheticMouseEvent<>) {
  e.stopPropagation();

  return false;
}

// Mobile Traewelling
// https://mobile.traewelling.de/page.php?module=ris&ris=2&2_cat=${abfahrt.trainType}&2_id=${abfahrt.trainType === 'S' ? abfahrt.trainId : abfahrt.trainNumber}&2_start=${abfahrt.currentStation}&2_to=${destination}&2_tm=${time}&2_date=${date}
// Traewelling
// https://traewelling.de/checkin?ris=2&2_cat=${abfahrt.trainType}&2_id=${abfahrt.trainType === 'S' ? abfahrt.trainId : abfahrt.trainNumber}&2_start=${abfahrt.currentStation}&2_to=${destination}&2_tm=${time}&2_date=${date}

const TraewellingLink = ({ abfahrt, show }: Props) => {
  const departure = abfahrt.scheduledDeparture;

  if (!departure || !show || !abfahrt.trainType || abfahrt.trainType === 'STB') {
    return null;
  }
  // const start = abfahrt.route[0].name;
  const destination = abfahrt.route[abfahrt.route.length - 1].name.replace(/ß/g, 'ss');
  const time = departure.toFormat('HH:mm').replace(':', '%3A');
  const date = departure.toFormat('yyyy-MM-dd');

  return (
    <a
      className="TraewellingLink"
      onClick={preventDefault}
      rel="noopener noreferrer"
      target="_blank"
      href={`https://traewelling.de/checkin?ris=2&2_cat=${abfahrt.trainType}&2_id=${
        abfahrt.trainType === 'S' ? abfahrt.trainId : abfahrt.trainNumber
      }&2_start=${abfahrt.currentStation.replace(/ß/g, 'ss')}&2_to=${destination}&2_tm=${time}&2_date=${date}`}
    >
      Traewelling
    </a>
  );
};

export default connect((state: AppState) => ({
  show: state.config.traewelling,
}))(TraewellingLink);