import { Button } from '@palladxyz/ui'
import { ArrowLeftIcon } from 'lucide-react'

type ButtonProps = {
  label: React.ReactNode
  onClick: () => void
}

type BackButtonProps = {
  onClick: () => void
}

interface ViewHeadingProps {
  title: string
  button?: ButtonProps
  backButton?: BackButtonProps
}

export const ViewHeading = ({
  title,
  button,
  backButton
}: ViewHeadingProps) => {
  return (
    <div className="flex gap-4 items-center justify-between">
      {backButton && (
        <Button variant="outline" size="icon" onClick={backButton.onClick}>
          <ArrowLeftIcon className="text-sky-500" size={20} />
        </Button>
      )}
      <h2 className="flex-1 text-lg">{title}</h2>
      {button && (
        <Button variant="outline" size="sm" onClick={button.onClick}>
          {button.label}
        </Button>
      )}
    </div>
  )
}
