import { Container } from "@/components/marketing/primitives"
import { networkList } from "@/config/networks"

const marqueeItems = [...networkList, ...networkList, ...networkList, ...networkList]

export function TrustBar() {
  return (
    <section className="pt-10 pb-6 sm:pt-16">
      <Container>
        <div className="overflow-hidden rounded-3xl border border-foreground/80 px-2 py-7 sm:py-8">
          <p className="text-center text-lg text-foreground sm:text-xl">
            Schedule, reply, and report across
          </p>
          <div className="relative mt-6 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
            <ul className="animate-marquee flex w-max items-center">
              {marqueeItems.map(({ id, name, Icon }, i) => (
                <li
                  key={`${id}-${i}`}
                  aria-hidden={i >= networkList.length}
                  className="flex items-center gap-2.5 px-8 text-foreground/75 sm:px-12"
                >
                  <Icon className="size-7" />
                  <span className="text-2xl font-semibold tracking-tight">{name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  )
}
