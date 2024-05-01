import { AppLayout } from "@/components/app-layout"
import { SettingsPageLayout } from "@/components/settings-page-layout"
import { Eye, Globe, Info, WalletMinimal } from "lucide-react"
import { Link } from "react-router-dom"

const Links = [
  {
    label: "Wallet",
    description: "Management and networks",
    href: "/settings/wallet",
    Icon: WalletMinimal,
  },
  {
    label: "Privacy",
    description: "Data sharing",
    href: "/settings/privacy",
    Icon: Eye,
  },
  {
    label: "Display",
    description: "Languages and currencies",
    href: "/settings/display",
    Icon: Globe,
  },
  {
    label: "About",
    description: "Everything about us",
    href: "/settings/about",
    Icon: Info,
  },
]

type SettingsViewProps = {
  onCloseClicked: () => void
  onDonateClicked: () => void
}

export const SettingsView = ({
  onCloseClicked,
  onDonateClicked,
}: SettingsViewProps) => {
  return (
    <AppLayout>
      <SettingsPageLayout
        title="Settings"
        onCloseClicked={onCloseClicked}
        headerContent={
          <div className="mt-6 px-6 py-4 flex items-center justify-between bg-neutral rounded-2xl">
            <p>Buy us a coffee!</p>
            <button
              type="button"
              className="px-8 btn btn-primary"
              onClick={onDonateClicked}
            >
              Send
            </button>
          </div>
        }
      >
        <div className="flex flex-col items-center space-y-6">
          <div className="w-full space-y-2">
            {Links.map((link) => {
              return (
                <Link
                  key={link.label}
                  to={link.href}
                  className="p-4 flex items-center space-x-4 bg-secondary rounded-2xl"
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-neutral">
                    <link.Icon
                      width={24}
                      height={24}
                      className="text-[#F6C177]"
                    />
                  </div>
                  <div>
                    <p>{link.label}</p>
                    <p className="text-sm">{link.description}</p>
                  </div>
                </Link>
              )
            })}
          </div>
          <button type="button" className="px-10 btn">
            Log out
          </button>
        </div>
      </SettingsPageLayout>
    </AppLayout>
  )
}
