import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiOutlineAcademicCap, HiOutlinePlay, HiOutlineUserGroup,
  HiOutlineStar, HiOutlineChartBar, HiOutlineBadgeCheck,
  HiOutlineCreditCard, HiOutlineHeart, HiOutlineLightningBolt,
  HiOutlineArrowRight, HiOutlineSparkles,
} from 'react-icons/hi';

const features = [
  {
    icon: HiOutlineChartBar,
    title: 'Progress Tracking',
    desc: 'Visual dashboards with real-time completion percentages and lesson-level tracking.',
    color: 'from-indigo-500/20 to-indigo-500/5',
    iconColor: 'text-indigo-400',
    border: 'hover:border-indigo-500/30',
  },
  {
    icon: HiOutlineBadgeCheck,
    title: 'Certificates',
    desc: 'Auto-generated PDF certificates on course completion you can share and download.',
    color: 'from-violet-500/20 to-violet-500/5',
    iconColor: 'text-violet-400',
    border: 'hover:border-violet-500/30',
  },
  {
    icon: HiOutlineCreditCard,
    title: 'Razorpay Payments',
    desc: 'Secure checkout with instant enrollment confirmation and full payment history.',
    color: 'from-blue-500/20 to-blue-500/5',
    iconColor: 'text-blue-400',
    border: 'hover:border-blue-500/30',
  },
  {
    icon: HiOutlineStar,
    title: 'Course Reviews',
    desc: 'Star ratings and comments help learners choose the right courses faster.',
    color: 'from-amber-500/20 to-amber-500/5',
    iconColor: 'text-amber-400',
    border: 'hover:border-amber-500/30',
  },
  {
    icon: HiOutlineHeart,
    title: 'Wishlist',
    desc: 'Save courses you love and come back to enroll when you\'re ready.',
    color: 'from-rose-500/20 to-rose-500/5',
    iconColor: 'text-rose-400',
    border: 'hover:border-rose-500/30',
  },
  {
    icon: HiOutlineLightningBolt,
    title: 'Admin Dashboard',
    desc: 'Comprehensive analytics — revenue, enrollments, popular courses at a glance.',
    color: 'from-emerald-500/20 to-emerald-500/5',
    iconColor: 'text-emerald-400',
    border: 'hover:border-emerald-500/30',
  },
];

const stats = [
  { icon: HiOutlinePlay, value: '50+', label: 'Courses', color: 'text-primary-light' },
  { icon: HiOutlineUserGroup, value: '1,000+', label: 'Students', color: 'text-violet-400' },
  { icon: HiOutlineStar, value: '4.8', label: 'Avg Rating', color: 'text-amber-400' },
  { icon: HiOutlineBadgeCheck, value: '100%', label: 'Certified', color: 'text-emerald-400' },
];

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-28">

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative text-center pt-12 pb-4 overflow-hidden">

        {/* Hero glow behind heading */}
        <div
          className="absolute left-1/2 top-0 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none"
          aria-hidden="true"
        />

        {/* Badge */}
        <div className="animate-fade-up" style={{ opacity: 0 }}>
          <span className="badge-glow">
            <HiOutlineSparkles className="w-3.5 h-3.5" />
            The Future of Online Learning
          </span>
        </div>

        {/* Heading */}
        <h1
          className="mt-7 text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.06] tracking-tight animate-fade-up anim-d-100"
          style={{ fontFamily: 'var(--font-display)', opacity: 0 }}
        >
          <span className="text-white">Learn without</span>
          <br />
          <span className="gradient-text-vivid">limits.</span>
        </h1>

        {/* Sub */}
        <p
          className="mt-6 text-lg text-gray-400 max-w-xl mx-auto leading-relaxed animate-fade-up anim-d-200"
          style={{ opacity: 0 }}
        >
          Access world-class courses, track your progress, earn certificates,
          and transform your career — all in one beautifully designed platform.
        </p>

        {/* CTAs */}
        <div
          className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-up anim-d-300"
          style={{ opacity: 0 }}
        >
          {user ? (
            <Link
              to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'}
              className="btn-glow inline-flex items-center gap-2 px-8 py-3.5 text-white font-bold rounded-2xl text-base"
            >
              Go to Dashboard <HiOutlineArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="btn-glow inline-flex items-center gap-2 px-8 py-3.5 text-white font-bold rounded-2xl text-base"
              >
                Start Learning Free <HiOutlineArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-base font-semibold text-gray-300 border border-white/10 hover:border-primary/40 hover:text-white hover:bg-white/5 transition-all"
              >
                <HiOutlinePlay className="w-4 h-4" /> Browse Courses
              </Link>
            </>
          )}
        </div>

        {/* Trust line */}
        <p
          className="mt-6 text-xs text-gray-600 animate-fade-up anim-d-400"
          style={{ opacity: 0 }}
        >
          No credit card required &nbsp;·&nbsp; Free courses available &nbsp;·&nbsp; Cancel anytime
        </p>

        {/* Stats strip */}
        <div
          className="mt-16 grid grid-cols-2 sm:grid-cols-4 max-w-2xl mx-auto gap-4 animate-fade-up anim-d-500"
          style={{ opacity: 0 }}
        >
          {stats.map((s) => (
            <div key={s.label} className="stat-card px-4 py-5 flex flex-col items-center gap-2">
              <s.icon className={`w-5 h-5 ${s.color}`} />
              <p className={`text-2xl font-black ${s.color}`} style={{ fontFamily: 'var(--font-display)' }}>
                {s.value}
              </p>
              <p className="text-xs text-gray-500 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="divider-gradient" />

      {/* ── Features ─────────────────────────────────────── */}
      <section>
        <div className="text-center mb-14">
          <p className="text-xs font-semibold text-primary-light tracking-widest uppercase mb-3">
            Platform Highlights
          </p>
          <h2
            className="text-3xl sm:text-4xl font-black text-white"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Everything you need to{' '}
            <span className="gradient-text">excel</span>
          </h2>
          <p className="text-gray-400 mt-3 max-w-lg mx-auto text-sm leading-relaxed">
            A complete toolkit built for both students who want to grow and admins who want to deliver.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`glass-card rounded-2xl p-6 group cursor-default border border-white/[0.07] ${f.border} transition-all duration-300`}
            >
              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <f.icon className={`w-6 h-6 ${f.iconColor}`} />
              </div>

              <h3
                className="text-base font-bold text-white mb-2 group-hover:gradient-text transition-all"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {f.title}
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────── */}
      {!user && (
        <section className="relative overflow-hidden rounded-3xl border border-primary/20 p-10 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(167,139,250,0.06) 50%, rgba(99,102,241,0.08) 100%)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Corner glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-32 bg-primary/20 blur-[60px] rounded-full pointer-events-none" />

          <div className="relative">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 mb-5">
              <HiOutlineAcademicCap className="w-7 h-7 text-primary-light" />
            </div>
            <h2
              className="text-2xl sm:text-3xl font-black text-white mb-3"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Ready to start learning?
            </h2>
            <p className="text-gray-400 text-sm mb-7 max-w-md mx-auto">
              Join thousands of students already building their future on LMS Pro.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/register"
                className="btn-glow inline-flex items-center gap-2 px-7 py-3 text-white font-bold rounded-xl text-sm"
              >
                Create Free Account <HiOutlineArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold text-gray-300 border border-white/10 hover:border-primary/30 hover:text-white hover:bg-white/5"
              >
                Browse Courses
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
