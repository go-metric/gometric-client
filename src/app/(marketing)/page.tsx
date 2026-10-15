import { Faq } from "@/components/marketing/faq"
import { Features } from "@/components/marketing/features"
import { FinalCta } from "@/components/marketing/final-cta"
import { Hero } from "@/components/marketing/hero"
import { Platforms } from "@/components/marketing/platforms"
import { SocialProof } from "@/components/marketing/social-proof"
import { Steps } from "@/components/marketing/steps"
import { TrustBar } from "@/components/marketing/trust-bar"
import { Workspace } from "@/components/marketing/workspace"

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <Workspace />
      <Features />
      <Steps />
      <Platforms />
      <SocialProof />
      <Faq />
      <FinalCta />
    </>
  )
}
