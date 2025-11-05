import EmblaCarousel from "../components/storeFront/emblaCarousel/homeCarousel";
import Newsletter from "../components/storeFront/Newsletter";

export default function Home() {
  return (
    <>
      <h1 className="text-5xl font-bold text-center">Home</h1>
      <section>
        <EmblaCarousel />
      </section>
      <section className="mt-12 px-4">
        <Newsletter />
      </section>
    </>
  );
}
