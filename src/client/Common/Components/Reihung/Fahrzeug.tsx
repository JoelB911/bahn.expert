import { Fahrzeug, FahrzeugType } from 'types/reihung';
import ActionAccessible from '@material-ui/icons/Accessible';
import ActionMotorcycle from '@material-ui/icons/Motorcycle';
import cc from 'classnames';
import MapsLocalDining from '@material-ui/icons/LocalDining';
import React, { useMemo } from 'react';
import useStyles from './Fahrzeug.style';
import WagenLink from './WagenLink';

export type InheritedProps = {
  scale: number;
  correctLeft: number;
  type: FahrzeugType;
};

export type OwnProps = InheritedProps & {
  fahrzeug: Fahrzeug;
  destination?: string;
  wrongWing: boolean;
  comfort?: string[];
};

type Props = OwnProps;

// Klasse: 0 = unknown
// Klasse: 1 = Nur erste
// Klasse: 2 = Nur zweite
// Klasse: 3 = 1 & 2
// klasse: 4 = Nicht für Passagiere. z.B. Triebkopf
type AdditionalFahrzeugInfos = {
  klasse: 0 | 1 | 2 | 3 | 4;
  speise: boolean;
  rollstuhl: boolean;
  fahrrad: boolean;
  comfort: boolean;
};

function getFahrzeugInfo(
  fahrzeug: Fahrzeug,
  comfortData?: string[]
): AdditionalFahrzeugInfos {
  const data: AdditionalFahrzeugInfos = {
    klasse: 0,
    speise: Boolean(
      fahrzeug.allFahrzeugausstattung.find(a => a.ausstattungsart === 'BISTRO')
    ),
    rollstuhl: Boolean(
      fahrzeug.allFahrzeugausstattung.find(
        a => a.ausstattungsart === 'PLAETZEROLLSTUHL'
      )
    ),
    fahrrad: Boolean(
      fahrzeug.allFahrzeugausstattung.find(
        a => a.ausstattungsart === 'PLAETZEFAHRRAD'
      )
    ),
    comfort: false,
  };

  switch (fahrzeug.kategorie) {
    case 'DOPPELSTOCKSTEUERWAGENZWEITEKLASSE':
    case 'DOPPELSTOCKWAGENZWEITEKLASSE':
    case 'REISEZUGWAGENZWEITEKLASSE':
    case 'STEUERWAGENZWEITEKLASSE':
      data.klasse = 2;
      break;
    case 'HALBSPEISEWAGENZWEITEKLASSE':
    case 'SPEISEWAGEN':
      data.klasse = 2;
      data.speise = true;
      break;
    default:
      break;
    case 'STEUERWAGENERSTEZWEITEKLASSE':
    case 'REISEZUGWAGENERSTEZWEITEKLASSE':
      data.klasse = 3;
      break;
    case 'HALBSPEISEWAGENERSTEKLASSE':
      data.klasse = 1;
      data.speise = true;
      break;
    case 'DOPPELSTOCKWAGENERSTEKLASSE':
    case 'REISEZUGWAGENERSTEKLASSE':
    case 'STEUERWAGENERSTEKLASSE':
      data.klasse = 1;
      break;
    case 'TRIEBKOPF':
    case 'LOK':
      data.klasse = 4;
  }

  if (comfortData) {
    data.comfort = comfortData.includes(fahrzeug.wagenordnungsnummer);
  }

  return data;
}

const FahrzeugComp = ({
  fahrzeug,
  wrongWing,
  scale,
  correctLeft,
  comfort,
  type,
}: Props) => {
  const classes = useStyles();
  const info = useMemo(() => getFahrzeugInfo(fahrzeug, comfort), [
    comfort,
    fahrzeug,
  ]);

  const { startprozent, endeprozent } = fahrzeug.positionamhalt;
  const start = Number.parseInt(startprozent, 10);
  const end = Number.parseInt(endeprozent, 10);

  const position = {
    left: `${(start - correctLeft) * scale}%`,
    width: `${(end - start) * scale}%`,
  };

  // @ts-ignore
  const klasseClassName: keyof typeof classes = `klasse${info.klasse}`;

  return (
    <div
      style={position}
      className={cc(classes.main, {
        [classes.closed]: fahrzeug.status === 'GESCHLOSSEN',
        [classes.wrongWing]: wrongWing,
      })}
    >
      <span className={cc(classes.klasse, classes[klasseClassName])} />
      <span className={classes.nummer}>{fahrzeug.wagenordnungsnummer}</span>
      <span className={classes.icons}>
        {info.rollstuhl && <ActionAccessible className={classes.icon} />}
        {info.fahrrad && <ActionMotorcycle className={classes.icon} />}
        {info.speise && <MapsLocalDining className={classes.icon} />}
      </span>
      {info.comfort && <span className={classes.comfort} />}
      <WagenLink
        type={type}
        fahrzeugnummer={fahrzeug.fahrzeugnummer}
        fahrzeugtyp={fahrzeug.fahrzeugtyp}
      />
    </div>
  );
};

export default FahrzeugComp;