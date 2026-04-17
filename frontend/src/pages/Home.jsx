import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineAcademicCap, HiOutlinePlay, HiOutlineUserGroup, HiOutlineStar } from 'react-icons/hi';

const Home = () => {
  const { user } = useAuth();

  const stats = [
    { icon: HiOutlinePlay, label: 'Courses', value: '50+' },
    { icon: HiOutlineUserGroup, label: 'Students', value: '1000+' },
    { icon: HiOutlineStar, label: 'Avg Rating', value: '4.8' },
  ];

  return (
    <div className="space-y-20">
      {/* Hero */}
      <section className="text-center py-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary-light text-sm font-medium mb-6">
          <HiOutlineAcademicCap className="w-4 h-4" />
          Welcome to LMS Pro
        </div>

        <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight">
          <span className="text-white">Learn without</span>
          <br />
          <span className="gradient-text">limits</span>
        </h1>

        <p className="mt-6 text-lg text-gray-400 max-w-2xl mx-auto">
          Access world-class courses, track your progress, earn certificates, and transform your career — all in one platform.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          {user ? (
            <Link
              to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'}
              className="px-8 py-3.5 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl text-lg"
            >
              Go to Dashboard →
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="px-8 py-3.5 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl text-lg"
              >
                Get Started Free
              </Link>
              <Link
                to="/courses"
                className="px-8 py-3.5 glass hover:bg-white/10 text-white font-semibold rounded-xl text-lg"
              >
                Browse Courses
              </Link>
            </>
          )}
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 max-w-lg mx-auto gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <stat.icon className="w-6 h-6 text-primary-light mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section>
        <h2 className="text-3xl font-bold text-center text-white mb-12">Why LMS Pro?</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'Progress Tracking', desc: 'Track your learning progress with detailed analytics and completion percentages.', emoji: '📊' },
            { title: 'Certificates', desc: 'Earn professional certificates on course completion to showcase your skills.', emoji: '🏆' },
            { title: 'Razorpay Payments', desc: 'Secure payment integration for premium courses with instant enrollment.', emoji: '💳' },
            { title: 'Course Reviews', desc: 'Rate and review courses to help other students make informed decisions.', emoji: '⭐' },
            { title: 'Wishlist', desc: 'Save courses for later and never miss out on your favorite topics.', emoji: '❤️' },
            { title: 'Admin Dashboard', desc: 'Comprehensive analytics for course creators to manage their content.', emoji: '📈' },
          ].map((feature) => (
            <div key={feature.title} className="glass rounded-2xl p-6 hover:bg-white/10 group cursor-default">
              <div className="text-3xl mb-4">{feature.emoji}</div>
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-primary-light">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
