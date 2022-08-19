import React, { memo } from 'react';
import { useDispatch } from 'react-redux';
import { LoadingOutlined } from '@ant-design/icons';
import Modal from '../components/Modal';
import { closeModal, openModal } from '../reducers/modals/actions';
import BisectHosting from '../../ui/Kome-Lab-Logo';
import ga from '../utils/analytics';

let timer;

const InstanceStartupAd = ({ instanceName }) => {
  const dispatch = useDispatch();

  const openBisectHostingModal = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    dispatch(closeModal());
    setTimeout(() => {
      ga.sendCustomEvent('BHAdViewNavbar');
      dispatch(openModal('BisectHosting'));
    }, 225);
  };

  return (
    <Modal
      css={`
        height: 330px;
        width: 650px;
        overflow-x: hidden;
      `}
      title={`${instanceName} を起動中ギリ...`}
    >
      <div
        css={`
          display: flex;
          justify-content: center;
          flex-direction: column;
          text-align: center;
        `}
      >
        <span
          css={`
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 30px;
            margin-top: 20px;
          `}
        >
          インスタンスを起動しているギリ...
          <LoadingOutlined
            css={`
              margin-left: 30px;
              font-size: 50px;
            `}
          />
        </span>
        <div
          css={`
            display: flex;
            align-items: center;
            justify-content: center;

            & > * {
              margin: 0 20px;
            }
          `}
        >
          <span
            css={`
              font-size: 18px;
            `}
          >
            Kome-LabGDLauncher <br /> を使ってくれてありがとうギリ!
          </span>
          <div
            css={`
              cursor: pointer;
            `}
          >
            <BisectHosting
              onClick={openBisectHostingModal}
              size={150}
              showPointerCursor
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default memo(InstanceStartupAd);
