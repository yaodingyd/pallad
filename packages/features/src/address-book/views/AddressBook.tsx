import { useNavigate } from 'react-router-dom'

import { AppLayout } from '../../common/components/AppLayout'
import { ViewHeading } from '../../common/components/ViewHeading'
import { useAddressBookStore } from '../../wallet/store/addressBook'
import { ContactTile } from '../components/ContactTile'

const DonatePallad = {
  name: 'Donate Pallad',
  address: 'B62qkYa1o6Mj6uTTjDQCob7FYZspuhkm4RRQhgJg9j4koEBWiSrTQrS'
}

export const AddressBookView = () => {
  const navigate = useNavigate()
  const contacts = useAddressBookStore((state) => state.contacts)
  return (
    <AppLayout>
      <div className="p-4 flex-1 gap-4">
        <ViewHeading
          title="Address Book"
          button={{
            label: 'Add Address',
            onClick: () => navigate('/contacts/new')
          }}
        />
        <div className="gap-2">
          <ContactTile
            contact={{
              name: DonatePallad.name,
              address: DonatePallad.address
            }}
          />
          {contacts.map((contact, i) => (
            <ContactTile key={i} contact={contact} index={i} />
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
