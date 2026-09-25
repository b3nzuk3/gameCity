import React from 'react'
import { Button } from '@/components/ui/button'
import storeInfo from '@/config/storeInfo'
import { canonicalUrl } from '@/lib/seoMetadata'
import {
  buildProductInquiryMessage,
  buildWhatsAppUrl,
} from '@/lib/whatsapp'
import { cn } from '@/lib/utils'

type WhatsAppProductButtonProps = {
  productName: string
  productPath: string
  className?: string
}

const WhatsAppProductButton = ({
  productName,
  productPath,
  className,
}: WhatsAppProductButtonProps) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()

    const productUrl = canonicalUrl(productPath)
    const message = buildProductInquiryMessage(productName, productUrl)
    window.open(buildWhatsAppUrl(storeInfo.phone, message), '_blank', 'noopener,noreferrer')
  }

  return (
    <Button
      type="button"
      variant="default"
      size="icon"
      aria-label={`Ask about ${productName} on WhatsApp`}
      title={`Ask about ${productName} on WhatsApp`}
      onClick={handleClick}
      className={cn(
        'h-9 w-9 shrink-0 rounded-md bg-[#25D366] p-0 text-white hover:bg-[#1DA851] focus-visible:ring-[#25D366]',
        className
      )}
    >
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 24 24"
        className="h-4 w-4 fill-current"
      >
        <path d="M20.52 3.48A11.8 11.8 0 0 0 12.05 0C5.495 0 .16 5.333.158 11.886c0 2.096.547 4.142 1.587 5.946L.057 24l6.308-1.655a11.9 11.9 0 0 0 5.684 1.447h.005c6.555 0 11.89-5.333 11.893-11.888a11.85 11.85 0 0 0-3.427-8.424ZM12.05 21.65h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.999-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.002-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.986 2.896a9.825 9.825 0 0 1 2.892 6.99c-.003 5.45-4.437 9.882-9.883 9.882Zm5.421-7.403c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.149-.174.198-.298.298-.497.1-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.57-.01-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.875 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.71.306 1.263.489 1.694.626.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347Z" />
      </svg>
    </Button>
  )
}

export default WhatsAppProductButton
