import { Component } from '@angular/core';

import { Beyond } from './sections/beyond';
import { Desktop } from './sections/desktop';
import { Faq } from './sections/faq';
import { Focus } from './sections/focus';
import { Footer } from './sections/footer';
import { GetStarted } from './sections/get-started';
import { Habits } from './sections/habits';
import { Hero } from './sections/hero';
import { HowItWorks } from './sections/how-it-works';
import { Hydration } from './sections/hydration';
import { Insights } from './sections/insights';
import { Learn } from './sections/learn';
import { Matrix } from './sections/matrix';
import { Nav } from './sections/nav';
import { Planner } from './sections/planner';
import { Privacy } from './sections/privacy';
import { Showcase } from './sections/showcase';
import { Source } from './sections/source';
import { Tasks } from './sections/tasks';
import { Why } from './sections/why';

/**
 * The page.
 *
 * One component per section, all of them rendered statically. There is no
 * router and no `@defer` block on purpose: this is a single page that a visitor
 * scrolls from top to bottom, so splitting the content into lazy chunks would
 * add a routing problem and a loading state without saving a byte that matters.
 * Every section is plain markup, which is what keeps the whole bundle small.
 *
 * The order below is the argument the page makes, in order: what it is, what
 * the window looks like, why it is not just a timer, then each capability in
 * the order a working day uses it — plan, focus, track, review — and finally
 * what it costs, what it cannot do, and where to get it.
 */
@Component({
  selector: 'app-root',
  imports: [
    Nav,
    Hero,
    Showcase,
    Beyond,
    Focus,
    Planner,
    Tasks,
    Matrix,
    Habits,
    Hydration,
    Insights,
    Privacy,
    Desktop,
    HowItWorks,
    Learn,
    Why,
    Source,
    GetStarted,
    Faq,
    Footer,
  ],
  templateUrl: './app.html',
})
export class App {}
