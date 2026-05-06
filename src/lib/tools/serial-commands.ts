export type SerialParity = 'none' | 'even' | 'odd' | 'mark' | 'space';
export type SerialFlowControl = 'none' | 'hardware';
export type SerialLineEnding = '\n' | '\r' | '\r\n' | '';

export interface SerialPortProfile {
  baudRate: number;
  dataBits: 7 | 8;
  stopBits: 1 | 2;
  parity: SerialParity;
  flowControl: SerialFlowControl;
  defaultLineEnding: SerialLineEnding;
}

export interface SerialSendStep {
  type: 'send';
  command: string;
  lineEnding?: SerialLineEnding;
}

export interface SerialWaitStep {
  type: 'wait';
  durationMs: number;
}

export type SerialActionStep = SerialSendStep | SerialWaitStep;

export interface SerialAction {
  id: string;
  label: string;
  description: string;
  steps: SerialActionStep[];
  confirm?: boolean;
  confirmMessage?: string;
}

export interface SerialCommandProfile {
  name: string;
  description: string;
  serial: SerialPortProfile;
  actions: SerialAction[];
}

const send = (command: string): SerialSendStep => ({ type: 'send', command });
const wait = (durationMs: number): SerialWaitStep => ({ type: 'wait', durationMs });

export const DEFAULT_SERIAL_COMMAND_PROFILE: SerialCommandProfile = {
  name: 'Colorado Mesh Default MeshCore USB Command Profile',
  description:
    'Default canned serial commands for MeshCore repeater firmware over raw UART.',
  serial: {
    baudRate: 115200,
    dataBits: 8,
    stopBits: 1,
    parity: 'none',
    flowControl: 'none',
    defaultLineEnding: '\r\n',
  },
  actions: [
    {
      id: 'information',
      label: 'Information',
      description: 'Read firmware version, board name, and clock.',
      steps: [send('ver'), wait(150), send('board'), wait(150), send('clock')],
    },
    {
      id: 'sync-clock',
      label: 'Sync Clock',
      description: 'Sync the device clock to the current system time.',
      steps: [send('clock sync')],
      confirm: true,
      confirmMessage: 'Sync the device clock to the current system time?',
    },
    {
      id: 'statistics',
      label: 'Statistics',
      description: 'Read various statistics counters.',
      steps: [send('stats-core'), wait(150), send('stats-radio'), wait(150), send('stats-packets')],
    },
    {
      id: 'clear-stats',
      label: 'Clear Statistics',
      description: 'Reset all statistics counters.',
      steps: [send('clear stats')],
      confirm: true,
      confirmMessage: 'Reset all statistics counters?',
    },
    {
      id: 'start-packet-logging',
      label: 'Start Packet Logging',
      description: 'Start logging packets.',
      steps: [send('log start')],
      confirm: true,
      confirmMessage: 'Start logging packets?',
    },
    {
      id: 'stop-packet-logging',
      label: 'Stop Packet Logging',
      description: 'Stop logging packets.',
      steps: [send('log stop')],
      confirm: true,
      confirmMessage: 'Stop logging packets?',
    },
    {
      id: 'summary',
      label: 'Summary',
      description: 'Run a series of commands to get a summary of the repeater.',
      steps: [
        send('ver'),
        wait(150),
        send('board'),
        wait(150),
        send('clock'),
        wait(150),
        send('get name'),
        wait(150),
        send('get role'),
        wait(150),
        send('get radio'),
        wait(150),
        send('get freq'),
        wait(150),
        send('get tx'),
        wait(150),
        send('get af'),
        wait(150),
        send('get repeat'),
        wait(150),
        send('get public.key'),
        wait(150),
        send('get lat'),
        wait(150),
        send('get lon'),
        wait(150),
        send('get advert.interval'),
        wait(150),
        send('get flood.advert.interval'),
        wait(150),
        send('get flood.max'),
        wait(150),
        send('get guest.password'),
        wait(150),
        send('get allow.read.only'),
        wait(150),
        send('get owner.info'),
        wait(150),
        send('get acl'),
        wait(150),
        send('get rxdelay'),
        wait(150),
        send('get txdelay'),
        wait(150),
        send('get direct.txdelay'),
      ],
    },
    {
      id: 'reboot',
      label: 'Reboot',
      description: 'Reboot the device.',
      steps: [send('reboot')],
      confirm: true,
      confirmMessage: 'Reboot the device?',
    },
    {
      id: 'factory-reset',
      label: 'Factory Reset',
      description: 'Reset all settings to factory defaults.',
      steps: [send('erase')],
      confirm: true,
      confirmMessage: 'Reset all settings to factory defaults?',
    },
    {
      id: 'neighbors',
      label: 'Neighbors',
      description: 'List neighbors and demonstrate neighbor-related commands.',
      steps: [send('discover.neighbors'), wait(500), send('neighbor')],
    },
    {
      id: 'bridge-config',
      label: 'Bridge Configuration',
      description: 'Inspect bridge parameters.',
      steps: [
        send('get bridge.enabled'),
        wait(100),
        send('get bridge.delay'),
        wait(100),
        send('get bridge.source'),
        wait(100),
        send('get bridge.baud'),
        wait(100),
        send('get bridge.secret'),
      ],
    },
    {
      id: 'regions',
      label: 'Region Management',
      description: 'Inspect regions and save region configuration.',
      steps: [send('region'), wait(150), send('region home'), wait(150), send('region get')],
      confirm: true,
      confirmMessage: 'Inspect regions and save region home configuration?',
    },
    {
      id: 'enable-gps',
      label: 'Enable GPS',
      description: 'Enable GPS and sync time.',
      steps: [send('gps on'), wait(100), send('gps sync')],
      confirm: true,
      confirmMessage: 'Enable GPS and sync?',
    },
    {
      id: 'disable-gps',
      label: 'Disable GPS',
      description: 'Disable GPS.',
      steps: [send('gps off')],
      confirm: true,
      confirmMessage: 'Disable GPS?',
    },
    {
      id: 'enable-power-saving',
      label: 'Enable Power Saving',
      description: 'Enable power saving mode.',
      steps: [send('powersaving on')],
      confirm: true,
      confirmMessage: 'Enable power saving mode?',
    },
    {
      id: 'disable-power-saving',
      label: 'Disable Power Saving',
      description: 'Disable power saving mode.',
      steps: [send('powersaving off')],
      confirm: true,
      confirmMessage: 'Disable power saving mode?',
    },
  ],
};

export const SERIAL_BAUD_RATES: readonly number[] = [
  9600, 19200, 38400, 57600, 115200, 230400, 460800, 921600,
];

export function lineEndingLabel(ending: SerialLineEnding): string {
  switch (ending) {
    case '\n':
      return 'LF (\\n)';
    case '\r':
      return 'CR (\\r)';
    case '\r\n':
      return 'CRLF (\\r\\n)';
    case '':
      return 'None';
  }
}
