// Entirely fictional online-course data, created for this demonstration.
export const exampleTime = `Workflow\tTotal\tPer active user\tUsers
Time(Catalog)\t240 min\t10 min\t24
Time(Lesson / reading)\t480 min\t24 min\t20
Time(Quiz / practice)\t180 min\t10 min\t18
Time(Progress)\t90 min\t6 min\t15
Time(Help)\t30 min\t3 min\t10
Time(Offline notes)\t45 min\t9 min\t5`;

export const exampleEdges = `From\tTo\tCount\tP(next)
Course catalog\tLesson / reading\t60\t0.60
Course catalog\tProgress dashboard\t25\t0.25
Course catalog\tSession ended\t15\t0.15
Lesson / reading\tQuiz / practice\t50\t0.50
Lesson / reading\tCourse catalog\t20\t0.20
Lesson / reading\tSession ended\t30\t0.30
Quiz / practice\tLesson / reading\t40\t0.40
Quiz / practice\tProgress dashboard\t50\t0.50
Quiz / practice\tHelp center\t10\t0.10
Progress dashboard\tCourse catalog\t70\t0.70
Progress dashboard\tSession ended\t30\t0.30
Help center\tLesson / reading\t75\t0.75
Help center\tSession ended\t25\t0.25
Session ended\tSession ended\t100\t1.00`;
