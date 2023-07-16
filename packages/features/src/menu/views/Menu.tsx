import { getSessionPersistence } from '@palladxyz/persistence'
import {
  ArrowRightIcon,
  InfoIcon,
  ListIcon,
  LockIcon,
  SettingsIcon
} from 'lucide-react'
import React from 'react'
import { useNavigate } from 'react-router-dom'

import { AppLayout } from '../../common/components/AppLayout'
import { ViewHeading } from '../../common/components/ViewHeading'
import { Button } from '@palladxyz/ui'

const MenuItem = ({ item }) => {
  return (
    <div
      onClick={item.onClick}
      className="flex-1 justify-start items-center px-4 py-2"
    >
      <div className="p-4 bg-sky-900 rounded-full">
        <item.Icon />
      </div>
      <div className="flex-1">{item.label}</div>
      <ArrowRightIcon />
    </div>
  )
}

export const MenuView = () => {
  const navigate = useNavigate()
  const MENU_ITEMS = [
    {
      label: 'Transaction',
      onClick: () => navigate('/transactions'),
      Icon: ListIcon
    },
    {
      label: 'Settings',
      onClick: () => navigate('/settings'),
      Icon: SettingsIcon
    },
    {
      label: 'About',
      onClick: () => navigate('/about'),
      Icon: InfoIcon
    },
    {
      label: 'Lock',
      onClick: async () => {
        await getSessionPersistence().setItem('spendingPassword', '')
        // await vaultStore.persist.rehydrate()
        return navigate('/unlock')
      },
      Icon: LockIcon
    }
  ]
  return (
    <AppLayout>
      <div className="flex flex-1 flex-col gap-4">
        <ViewHeading title="Menu" />
        <div className="flex flex-col gap-2">
          {MENU_ITEMS.map((item, i) => (
            <Button
              key={i}
              variant="outline"
              className="flex-1 justify-between items-center"
            >
              <div className="flex items-center gap-6">
                <item.Icon />
                {item.label}
              </div>
              <ArrowRightIcon />
            </Button>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
