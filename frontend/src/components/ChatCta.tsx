import { MessageCircle } from 'lucide-react'

export function ChatCta() {
  return (
    <a className="chat-cta" href="https://wa.me/" aria-label="Chat customer support">
      <MessageCircle size={19} />
      Chat CS
    </a>
  )
}
