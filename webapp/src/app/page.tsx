import CreateCourse from "@/components/CreateCourse";
import JoinCourse from "@/components/JoinCourse";
import PrivyLoginButton from "@/components/PrivyLoginButton";
import CompleteLessonButton from "@/components/CompleteLessonButton";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1>ARANYA</h1>
        <PrivyLoginButton />
        <CreateCourse />
        <JoinCourse courseId={7}/>
        <CompleteLessonButton lessonId={8} moduleId={4} courseId={5} />

        <button>Run migrations</button>


      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
      </footer>
    </div>
  );
}
