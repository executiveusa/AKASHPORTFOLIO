import { ArrowCircleLeft, ListCheckbox, Plus, SettingTwo } from '@icon-park/react';
import classNames from 'classnames';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import WorkspaceGroupedHistory from './pages/conversation/WorkspaceGroupedHistory';
import SettingsSider from './pages/settings/SettingsSider';
import { iconColors } from './theme/colors';
import { Tooltip } from '@arco-design/web-react';
import { usePreviewContext } from './pages/conversation/preview';

interface SiderProps {
  onSessionClick?: () => void;
  collapsed?: boolean;
}

const Sider: React.FC<SiderProps> = ({ onSessionClick, collapsed = false }) => {
  const location = useLocation();
  const { pathname, search, hash } = location;

  const { t } = useTranslation();
  const navigate = useNavigate();
  const { closePreview } = usePreviewContext();
  const [isBatchMode, setIsBatchMode] = useState(false);
  const isSettings = pathname.startsWith('/settings');
  const lastNonSettingsPathRef = useRef('/guid');

  useEffect(() => {
    if (!pathname.startsWith('/settings')) {
      lastNonSettingsPathRef.current = `${pathname}${search}${hash}`;
    }
  }, [pathname, search, hash]);

  const handleSettingsClick = () => {
    if (isSettings) {
      const target = lastNonSettingsPathRef.current || '/guid';
      Promise.resolve(navigate(target)).catch((error) => {
        console.error('Navigation failed:', error);
      });
    } else {
      Promise.resolve(navigate('/settings/gemini')).catch((error) => {
        console.error('Navigation failed:', error);
      });
    }
    if (onSessionClick) {
      onSessionClick();
    }
  };

  const handleToggleBatchMode = () => {
    setIsBatchMode((prev) => !prev);
  };

  return (
    <div className='size-full flex flex-col'>
      {/* Main content area */}
      <div className='flex-1 min-h-0 overflow-hidden'>
        {isSettings ? (
          <SettingsSider collapsed={collapsed}></SettingsSider>
        ) : (
          <div className='size-full flex flex-col'>
            <div className='mb-12px shrink-0 flex items-center gap-10px'>
              <Tooltip disabled={!collapsed} content={t('conversation.welcome.newConversation')} position='right'>
                <div
                  className='h-48px flex-1 flex items-center justify-start gap-12px px-16px hover:bg-white/40 hover:shadow-sm rd-24px cursor-pointer group transition-all border border-transparent hover:border-[#F0F0F0]'
                  onClick={() => {
                    closePreview();
                    setIsBatchMode(false);
                    Promise.resolve(navigate('/guid')).catch((error) => {
                      console.error('Navigation failed:', error);
                    });
                    // 点击new chat后自动隐藏sidebar / Hide sidebar after starting new chat on mobile
                    if (onSessionClick) {
                      onSessionClick();
                    }
                  }}
                >
                  <Plus theme='outline' size='20' fill={iconColors.primary} className='block leading-none shrink-0' style={{ lineHeight: 0 }} />
                  <span className='collapsed-hidden font-semibold text-t-primary leading-24px'>{t('conversation.welcome.newConversation')}</span>
                </div>
              </Tooltip>
              <Tooltip disabled={!collapsed} content={isBatchMode ? t('conversation.history.batchModeExit') : t('conversation.history.batchManage')} position='right'>
                <div
                  className={classNames('h-48px w-48px rd-24px flex items-center justify-center cursor-pointer shrink-0 transition-all border border-solid border-transparent', {
                    'hover:bg-white/40 hover:border-[#F0F0F0]': !isBatchMode,
                    'bg-[rgba(var(--primary-6),0.12)] border-[rgba(var(--primary-6),0.24)] text-primary': isBatchMode,
                  })}
                  onClick={handleToggleBatchMode}
                >
                  <ListCheckbox theme='outline' size='20' className='block leading-none shrink-0' style={{ lineHeight: 0 }} />
                </div>
              </Tooltip>
            </div>
            <WorkspaceGroupedHistory collapsed={collapsed} onSessionClick={onSessionClick} batchMode={isBatchMode} onBatchModeChange={setIsBatchMode}></WorkspaceGroupedHistory>
          </div>
        )}
      </div>
      {/* Footer - settings button */}
      <div className='shrink-0 sider-footer mt-auto pt-12px'>
        <Tooltip disabled={!collapsed} content={isSettings ? t('common.back') : t('common.settings')} position='right'>
          <div
            onClick={handleSettingsClick}
            className={classNames('flex items-center justify-start gap-12px px-16px py-10px rd-24px cursor-pointer transition-all border border-transparent', {
              'bg-[rgba(var(--primary-6),0.1)] border-[rgba(var(--primary-1),0.5)] text-primary': isSettings,
              'hover:bg-white/40 hover:border-[#F0F0F0] hover:shadow-sm active:bg-fill-2': !isSettings,
            })}
          >
            {isSettings ? <ArrowCircleLeft className='flex' theme='outline' size='20' fill={iconColors.primary} /> : <SettingTwo className='flex' theme='outline' size='20' fill={iconColors.primary} />}
            <span className='collapsed-hidden text-t-primary font-medium'>{isSettings ? t('common.back') : t('common.settings')}</span>
          </div>
        </Tooltip>
      </div>
    </div>
  );
};

export default Sider;
