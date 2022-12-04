import axios from 'axios';
import { Account, Client, Connection, Library, ServerConnection } from 'hex-plex';
import type { IAuth, IConfig } from 'types/interfaces';

const sysInfo = window.electron.getAppInfo();

const normalizedPlatform = (platform: string): string => {
  switch (platform) {
    case 'darwin': return 'macOS';
    case 'linux': return 'Linux';
    case 'win32': return 'Windows';
    default: throw new Error('no matching platform');
  }
};

const initializeApp = async (config: IConfig) => {
  try {
    const client = new Client({
      identifier: config.clientId,
      product: sysInfo.appName,
      version: sysInfo.appVersion,
      device: normalizedPlatform(sysInfo.platform),
      deviceName: sysInfo.hostname,
      platform: normalizedPlatform(sysInfo.platform),
      platformVersion: sysInfo.version,
    });
    const account = new Account(client, config.token);
    const servers = await account.servers();
    const server = servers.devices.find((device) => device.name === config?.serverName);
    if (!server) {
      return undefined;
    }
    const promises = server?.connections.map((conn, index) => {
      const { uri } = server.connections[index];
      return axios.get(`${uri}/servers?X-Plex-Token=${server.accessToken}`, {
        timeout: 10000,
        data: conn,
      });
    });
    if (promises) {
      const connection: Connection = await Promise.race(promises)
        .then((r) => JSON.parse(r.config.data));
      const serverConnection = new ServerConnection(connection.uri, account);
      const library = new Library(serverConnection);
      return { account, server, library } as IAuth;
    }
  } catch {
    return undefined;
  }
  return undefined;
};

export default initializeApp;