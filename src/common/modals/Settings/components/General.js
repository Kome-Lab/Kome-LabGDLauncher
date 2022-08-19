import React, { useState, useEffect, memo } from 'react';
import styled from 'styled-components';
import { ipcRenderer, clipboard } from 'electron';
import { useSelector, useDispatch } from 'react-redux';
import path from 'path';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import fsa from 'fs-extra';
import { promises as fs } from 'fs';
import {
  faCopy,
  faDownload,
  faTachometerAlt,
  faTrash,
  faPlay,
  faToilet,
  // faNewspaper, ※手動で無効化
  faFolder,
  faFire,
  faSort
} from '@fortawesome/free-solid-svg-icons';
import { Select, Tooltip, Button, Switch, Input, Checkbox } from 'antd';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';
import {
  _getCurrentAccount,
  _getDataStorePath,
  _getInstancesPath,
  _getTempPath
} from '../../../utils/selectors';
import {
  updateDiscordRPC,
  updateHideWindowOnGameLaunch,
  updatePotatoPcMode,
  updateInstanceSortType,
  // updateShowNews, ※手動で無効化
  updateCurseReleaseChannel
} from '../../../reducers/settings/actions';
import { updateConcurrentDownloads } from '../../../reducers/actions';
import { openModal } from '../../../reducers/modals/actions';
import HorizontalLogo from '../../../../ui/Kome-Lab-Mono-Logo';
import { extractFace } from '../../../../app/desktop/utils';

const Title = styled.div`
  margin-top: 30px;
  margin-bottom: 5px;
  font-size: 15px;
  font-weight: 700;
  color: ${props => props.theme.palette.text.primary};
  z-index: 1;
  text-align: left;
  -webkit-backface-visibility: hidden;
`;

const Content = styled.div`
  width: 100%;
  text-align: left;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  *:first-child {
    margin-right: 15px;
  }
`;

const PersonalData = styled.div`
  margin-top: 38px;
  width: 100%;
`;

const MainTitle = styled.h1`
  color: ${props => props.theme.palette.text.primary};
  margin: 0 500px 20px 0;
  font-size: 20px;
`;

const ProfileImage = styled.img`
  position: relative;
  top: 20px;
  left: 20px;
  background: #212b36;
  width: 50px;
  height: 50px;
`;

const Uuid = styled.div`
  font-size: smaller;
  font-weight: 200;
  color: ${props => props.theme.palette.grey[100]};
  display: flex;
`;

const Username = styled.div`
  font-size: smaller;
  font-weight: 200;
  color: ${props => props.theme.palette.grey[100]};
  display: flex;
`;

const PersonalDataContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  background: ${props => props.theme.palette.grey[900]};
  border-radius: ${props => props.theme.shape.borderRadius};
`;

const LauncherVersion = styled.div`
  margin: 30px 0;
  p {
    text-align: left;
    color: ${props => props.theme.palette.text.third};
    margin: 0 0 0 6px;
  }

  h1 {
    color: ${props => props.theme.palette.text.primary};
  }
`;

const CustomDataPathContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  border-radius: ${props => props.theme.shape.borderRadius};

  h1 {
    width: 100%;
    font-size: 15px;
    font-weight: 700;
    color: ${props => props.theme.palette.text.primary};
    z-index: 1;
    text-align: left;
  }
`;

function copy(setCopied, copyText) {
  setCopied(true);
  clipboard.writeText(copyText);
  setTimeout(() => {
    setCopied(false);
  }, 500);
}

function dashUuid(UUID) {
  // UUID is segmented into: 8 - 4 - 4 - 4 - 12
  // Then dashes are added between.

  // eslint-disable-next-line
  return `${UUID.substring(0, 8)}-${UUID.substring(8, 12)}-${UUID.substring(
    12,
    16
  )}-${UUID.substring(16, 20)}-${UUID.substring(20, 32)}`;
}

const General = () => {
  /* eslint-disable prettier/prettier */
  const tempPath = useSelector(_getTempPath);
  const dataStorePath = useSelector(_getDataStorePath);
  const instancesPath = useSelector(_getInstancesPath);
  const currentAccount = useSelector(_getCurrentAccount);
  const userData = useSelector(state => state.userData);
  const isPlaying = useSelector(state => state.startedInstances);
  const queuedInstances = useSelector(state => state.downloadQueue);
  const updateAvailable = useSelector(state => state.updateAvailable);
  // const showNews = useSelector(state => state.settings.showNews); ※手動で無効化
  const DiscordRPC = useSelector(state => state.settings.discordRPC);
  const potatoPcMode = useSelector(state => state.settings.potatoPcMode);
  const concurrentDownloads = useSelector(
    state => state.settings.concurrentDownloads
  );
  const curseReleaseChannel = useSelector(
    state => state.settings.curseReleaseChannel
  );
  const hideWindowOnGameLaunch = useSelector(
    state => state.settings.hideWindowOnGameLaunch
  );
  const instanceSortMethod = useSelector(
    state => state.settings.instanceSortOrder
  );
  /* eslint-enable */

  const [dataPath, setDataPath] = useState(userData);
  const [copiedUuid, setCopiedUuid] = useState(false);
  const [moveUserData, setMoveUserData] = useState(false);
  const [deletingInstances, setDeletingInstances] = useState(false);
  const [loadingMoveUserData, setLoadingMoveUserData] = useState(false);
  const [version, setVersion] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [releaseChannel, setReleaseChannel] = useState(null);

  const dispatch = useDispatch();

  const disableInstancesActions =
    Object.keys(queuedInstances).length > 0 ||
    Object.keys(isPlaying).length > 0;

  useEffect(() => {
    ipcRenderer.invoke('getAppVersion').then(setVersion).catch(console.error);
    extractFace(currentAccount.skin).then(setProfileImage).catch(console.error);
    ipcRenderer
      .invoke('getAppdataPath')
      .then(appData =>
        fsa
          .readFile(path.join(appData, 'gdlauncher_next', 'rChannel'))
          .then(v => setReleaseChannel(parseInt(v.toString(), 10)))
          .catch(() => setReleaseChannel(0))
      )
      .catch(console.error);
  }, []);

  const clearSharedData = async () => {
    setDeletingInstances(true);
    try {
      await fsa.emptyDir(dataStorePath);
      await fsa.emptyDir(instancesPath);
      await fsa.emptyDir(tempPath);
    } catch (e) {
      console.error(e);
    }
    setDeletingInstances(false);
  };

  const changeDataPath = async () => {
    setLoadingMoveUserData(true);
    const appData = await ipcRenderer.invoke('getAppdataPath');
    const appDataPath = path.join(appData, 'gdlauncher_next');

    const notCopiedFiles = [
      'Cache',
      'Code Cache',
      'Dictionaries',
      'GPUCache',
      'Cookies',
      'Cookies-journal'
    ];
    await fsa.writeFile(path.join(appDataPath, 'override.data'), dataPath);

    if (moveUserData) {
      try {
        const files = await fs.readdir(userData);
        await Promise.all(
          files.map(async name => {
            if (!notCopiedFiles.includes(name)) {
              await fsa.copy(
                path.join(userData, name),
                path.join(dataPath, name),
                {
                  overwrite: true
                }
              );
            }
          })
        );
      } catch (e) {
        console.error(e);
      }
    }
    setLoadingMoveUserData(false);
    await ipcRenderer.invoke('appRestart');
  };

  const openFolder = async () => {
    const { filePaths, canceled } = await ipcRenderer.invoke(
      'openFolderDialog',
      userData
    );
    if (!filePaths[0] || canceled) return;
    setDataPath(filePaths[0]);
  };

  return (
    <>
      <PersonalData>
        <MainTitle>一般設定</MainTitle>
        <PersonalDataContainer>
          <ProfileImage
            src={profileImage ? `data:image/jpeg;base64,${profileImage}` : null}
          />
          <div
            css={`
              margin: 20px 20px 20px 40px;
              width: 330px;
              * {
                text-align: left;
              }
            `}
          >
            <div>
              ユーザー名 <br />
              <Username>{currentAccount.selectedProfile.name}</Username>
            </div>
            <div>
              UUID
              <br />
              <Uuid>
                {dashUuid(currentAccount.selectedProfile.id)}
                <Tooltip title={copiedUuid ? 'Copied' : 'Copy'} placement="top">
                  <div
                    css={`
                      width: 13px;
                      height: 14px;
                      margin: 0 0 0 10px;
                    `}
                  >
                    <FontAwesomeIcon
                      icon={faCopy}
                      onClick={() =>
                        copy(
                          setCopiedUuid,
                          dashUuid(currentAccount.selectedProfile.id)
                        )
                      }
                    />
                  </div>
                </Tooltip>
              </Uuid>
            </div>
          </div>
        </PersonalDataContainer>
      </PersonalData>
      <Title>リリース チャンネル</Title>
      <Content>
        <p>更新時に安定版を利用するかベータ版を利用するかを設定するギリ。</p>
        <Select
          css={`
            width: 100px;
          `}
          onChange={async e => {
            const appData = await ipcRenderer.invoke('getAppdataPath');
            setReleaseChannel(e);
            await fsa.writeFile(
              path.join(appData, 'gdlauncher_next', 'rChannel'),
              e.toString()
            );
          }}
          value={releaseChannel}
          virtual={false}
        >
          <Select.Option value={0}>安定版</Select.Option>
          <Select.Option value={1}>ベータ版</Select.Option>
        </Select>
      </Content>
      <Title>
        同時ダウンロード数 &nbsp; <FontAwesomeIcon icon={faTachometerAlt} />
      </Title>
      <Content>
        <p>同時にダウンロードできる最大値を設定するギリ。(おすすめは3)</p>
        <Select
          onChange={v => dispatch(updateConcurrentDownloads(v))}
          value={concurrentDownloads}
          css={`
            width: 80px;
            text-align: start;
          `}
          virtual={false}
        >
          {[...Array(10).keys()]
            .map(x => x + 1)
            .map(x => (
              <Select.Option key={x} value={x}>
                {x}
              </Select.Option>
            ))}
        </Select>
      </Content>
      <Title>
        インスタンスの並び順 <FontAwesomeIcon icon={faSort} />
      </Title>
      <Content>
        <p
          css={`
            margin: 0;
            width: 400px;
          `}
        >
          インスタンスの並べ替え方法を変えれるギリ。
        </p>

        <Select
          onChange={v => dispatch(updateInstanceSortType(v))}
          value={instanceSortMethod}
          css={`
            width: 180px;
            text-align: start;
          `}
        >
          <Select.Option value={0}>名前順</Select.Option>
          <Select.Option value={1}>最後にプレイした順</Select.Option>
          <Select.Option value={2}>よく遊んでる順</Select.Option>
        </Select>
      </Content>
      <Title>
        優先するCurseのリリースチャンネル <FontAwesomeIcon icon={faFire} />
      </Title>
      <Content>
        <p>
          Curseプロジェクトをダウンロードするための優先リリースチャンネルを選択するギリ。
          <br />
          これは、MODのアップデートにも適用されるギリ。
        </p>
        <Select
          css={`
            width: 135px;
            text-align: start;
          `}
          onChange={e => dispatch(updateCurseReleaseChannel(e))}
          value={curseReleaseChannel}
          virtual={false}
        >
          <Select.Option value={1}>安定版</Select.Option>
          <Select.Option value={2}>ベータ版</Select.Option>
          <Select.Option value={3}>アルファ版</Select.Option>
        </Select>
      </Content>
      <Title>
        Discord RPC設定 <FontAwesomeIcon icon={faDiscord} />
      </Title>
      <Content>
        <p>
          有効化すると、Discordのステータスにプレイしていることが表示されるギリ。
        </p>
        <Switch
          onChange={e => {
            dispatch(updateDiscordRPC(e));
            if (e) {
              ipcRenderer.invoke('init-discord-rpc');
            } else {
              ipcRenderer.invoke('shutdown-discord-rpc');
            }
          }}
          checked={DiscordRPC}
        />
      </Content>
      {/* <Title>
        Minecraft ニュース 表示設定 <FontAwesomeIcon icon={faNewspaper} />
      </Title>
      <Content>
        <p>有効化するとインスタンス選択画面上部にニュースが表示されるギリ</p>
        <Switch
          onChange={e => {
            dispatch(updateShowNews(e));
          }}
          checked={showNews}
        />
        </Content> */}
      <Title>
        インスタンス起動時 ランチャー自動非表示{' '}
        <FontAwesomeIcon icon={faPlay} />
      </Title>
      <Content>
        <p>
          インスタンス起動時にランチャーを自動的に非表示にし、
          <br />
          アイコントレイに表示するギリ。
        </p>
        <Switch
          onChange={e => {
            dispatch(updateHideWindowOnGameLaunch(e));
          }}
          checked={hideWindowOnGameLaunch}
        />
      </Content>
      <Title>
        ポテト PC モード &nbsp; <FontAwesomeIcon icon={faToilet} />
      </Title>
      <Content>
        <p>
          もしかして、あなたのPCは低スペックなPCでこのランチャーが重いギリ？
          <br />
          そんな時はこの設定を有効化すると、少し軽くなるかもギリ。
        </p>
        <Switch
          onChange={e => {
            dispatch(updatePotatoPcMode(e));
          }}
          checked={potatoPcMode}
        />
      </Content>
      <Title>
        初期化 <FontAwesomeIcon icon={faTrash} />
      </Title>
      <Content>
        <p>全てのデータを削除して初期状態にするギリ。</p>
        <Button
          onClick={() => {
            dispatch(
              openModal('ActionConfirmation', {
                message:
                  '本当に全部消しても良いギリ？(※どうなっても知らないギリよ?)',
                confirmCallback: clearSharedData,
                title: 'Confirm'
              })
            );
          }}
          disabled={disableInstancesActions}
          loading={deletingInstances}
        >
          削除
        </Button>
      </Content>
      <Title>
        データ保存場所 <FontAwesomeIcon icon={faFolder} />
        <a
          css={`
            margin-left: 30px;
          `}
          onClick={async () => {
            const appData = await ipcRenderer.invoke('getAppdataPath');
            const appDataPath = path.join(appData, 'kome-labgdlauncher_next');
            setDataPath(appDataPath);
          }}
        >
          保存場所をリセットする
        </a>
      </Title>
      <CustomDataPathContainer>
        <div
          css={`
            display: flex;
            justify-content: space-between;
            text-align: left;
            width: 100%;
            height: 30px;
            margin-bottom: 10px;
            p {
              text-align: left;
              color: ${props => props.theme.palette.text.third};
            }
          `}
        >
          <Input
            value={dataPath}
            onChange={e => setDataPath(e.target.value)}
            disabled={
              loadingMoveUserData ||
              deletingInstances ||
              disableInstancesActions
            }
          />
          <Button
            css={`
              margin-left: 20px;
            `}
            onClick={openFolder}
            disabled={loadingMoveUserData || deletingInstances}
          >
            <FontAwesomeIcon icon={faFolder} />
          </Button>
          <Button
            css={`
              margin-left: 20px;
            `}
            onClick={changeDataPath}
            disabled={
              disableInstancesActions ||
              userData === dataPath ||
              !dataPath ||
              dataPath.length === 0 ||
              deletingInstances
            }
            loading={loadingMoveUserData}
          >
            適用 & 再起動
          </Button>
        </div>
        <div
          css={`
            display: flex;
            justify-content: flex-start;
            width: 100%;
          `}
        >
          <Checkbox
            onChange={e => {
              setMoveUserData(e.target.checked);
            }}
          >
            元のデータを新しい場所にコピーするギリ
          </Checkbox>
        </div>
      </CustomDataPathContainer>
      <LauncherVersion>
        <div
          css={`
            display: flex;
            justify-content: flex-start;
            align-items: center;
            margin: 10px 0;
          `}
        >
          <HorizontalLogo
            size={150}
            onClick={() => dispatch(openModal('ChangeLogs'))}
          />{' '}
          <div
            css={`
              margin-left: 10px;
            `}
          >
            v {version}
          </div>
        </div>
        <p>
          {updateAvailable
            ? 'インストール可能なアップデートがあるギリ！<br />アップデートをクリックしてインストールし、ランチャーを再起動するギリ。'
            : 'このバージョンは最新版ギリ!自動的にアップデートを確認し、アップデートがある場合は　　お知らせするギリ。'}
        </p>
        <div
          css={`
            margin-top: 20px;
            height: 36px;
            display: flex;
            flex-direction: row;
          `}
        >
          {updateAvailable ? (
            <Button
              onClick={() =>
                ipcRenderer.invoke('installUpdateAndQuitOrRestart')
              }
              css={`
                margin-right: 10px;
              `}
              type="primary"
            >
              更新 &nbsp;
              <FontAwesomeIcon icon={faDownload} />
            </Button>
          ) : (
            <div
              css={`
                width: 96px;
                height: 36px;
                padding: 6px 8px;
              `}
            >
              最新版ギリ
            </div>
          )}
        </div>
      </LauncherVersion>
    </>
  );
};

export default memo(General);
