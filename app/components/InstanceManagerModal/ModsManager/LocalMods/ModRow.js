// @flow

import React, { useMemo, useEffect, useState } from 'react';
import fs from 'fs';
import path from 'path';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faDownload } from '@fortawesome/free-solid-svg-icons';
import { promisify } from 'util';
import { Checkbox, Switch } from 'antd';
import { PACKS_PATH } from '../../../../constants';

import styles from './LocalMods.scss';
import { readConfig, updateConfig } from '../../../../utils/instances';
import { getAddonFiles } from '../../../../utils/cursemeta';
import { downloadMod } from '../../../../utils/mods';

type Props = {
  index: number,
  style: {},
  toggleSize: () => mixed,
  modData: {},
  setFilteredMods: () => mixed,
  instance: string
};

const ModRow = ({
  index,
  style,
  toggleSize,
  modData,
  setFilteredMods,
  instance
}: Props) => {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(null);

  useEffect(() => {
    if (modData.projectID && modData.fileID) {
      getAddonFiles(modData.projectID).then(files => {
        const filteredFiles = files.filter(v => v.gameVersion.includes(modData.version));
        const installedMod = files.find(v => v.id === modData.fileID);
        if(installedMod && new Date(installedMod.fileDate) < new Date(filteredFiles[0].fileDate)) {
          setIsUpdateAvailable(filteredFiles[0]);
        }
      });
    }
  }, []);

  const modsFolder = path.join(PACKS_PATH, instance, 'mods');
  const selectMod = () => {
    setFilteredMods(prevMods =>
      Object.assign([...prevMods], {
        [index]: {
          ...prevMods[index],
          selected: !modData.selected
        }
      })
    );
  };

  const deleteMod = async () => {
    // Remove the actual file
    await promisify(fs.unlink)(path.join(modsFolder, modData.name));
    // Remove the reference in the mods file json
    const config = await readConfig(instance);
    await updateConfig(instance, {
      mods: config.mods.filter(v => v.filename !== modData.name)
    })

  };

  const toggleDisableMod = async (enabled) => {
    if (enabled) {
      await promisify(fs.rename)(
        path.join(modsFolder, modData.name),
        path.join(modsFolder, modData.name.replace('.disabled', ''))
      );
    } else {
      await promisify(fs.rename)(
        path.join(modsFolder, modData.name),
        path.join(modsFolder, `${modData.name}.disabled`)
      );
    }
  };

  const updateMod = async () => {
    await deleteMod();
    const newMod = await downloadMod(modData.projectID, isUpdateAvailable.id, null, instance);
    const instanceCfg = await readConfig(instance);
    await updateConfig(instance, { mods: [...(instanceCfg.mods || []), newMod] })
  };

  return (
    <div
      className={index % 2 ? styles.listItemOdd : styles.listItemEven}
      style={style}
      onClick={e => {
        // e.stopPropagation();
        // toggleSize(index);
      }}
      role="none"
      key={modData.name}
    >
      <div className={styles.innerItemMod}>
        <div>
          <Checkbox
            onChange={e => {
              selectMod();
            }}
            checked={modData.selected}
          />
          <Switch
            checked={modData.state}
            style={{
              marginLeft: 15
            }}
            onChange={(v, e) => {
              e.stopPropagation();
              toggleDisableMod(v);
            }}
          />
        </div>
        {modData.name.replace('.disabled', '')}
        <div>
          {isUpdateAvailable && <FontAwesomeIcon
            className={styles.updateIcon}
            icon={faDownload}
            onClick={() => updateMod()}
          />}
          <FontAwesomeIcon
            className={styles.deleteIcon}
            icon={faTrash}
            onClick={() => deleteMod()}
          />
        </div>
      </div>
    </div>
  );
};

export default ModRow;
