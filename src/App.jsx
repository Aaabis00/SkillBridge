import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import Auth from './Auth';
import {
  getSkills,
  addSkill as saveSkill,
  deleteSkill as removeSkill,
  getRequests,
  addRequest as saveRequest,
  deleteRequest as removeRequest,
  setAccessTokenGetter,
} from './api';

const initialSkills = [
  {
    id: 1,
    name: 'Python Programming',
    category: 'Technology',
    level: 'Intermediate',
    teacher: 'Aarav Sharma',
    emoji: '💻',
    description: 'Learn Python fundamentals, problem solving and practical coding.',
    wantsToLearn: 'Web Development',
    availability: 'Weekends',
  },
  {
    id: 2,
    name: 'UI/UX Design',
    category: 'Design',
    level: 'Beginner',
    teacher: 'Priya Patel',
    emoji: '🎨',
    description: 'Explore wireframes, user research and beautiful interfaces.',
    wantsToLearn: 'Frontend Development',
    availability: 'Evenings',
  },
  {
    id: 3,
    name: 'Public Speaking',
    category: 'Communication',
    level: 'Beginner',
    teacher: 'Rohan Mehta',
    emoji: '🎤',
    description: 'Build confidence, structure presentations and speak clearly.',
    wantsToLearn: 'Communication Skills',
    availability: 'Weekends',
  },
  {
    id: 4,
    name: 'Video Editing',
    category: 'Creative',
    level: 'Intermediate',
    teacher: 'Ananya Rao',
    emoji: '🎬',
    description: 'Learn transitions, storytelling and editing techniques.',
    wantsToLearn: 'Graphic Design',
    availability: 'Evenings',
  },
  {
    id: 5,
    name: 'Web Development',
    category: 'Technology',
    level: 'Advanced',
    teacher: 'Kabir Shah',
    emoji: '🌐',
    description: 'Build responsive websites using HTML, CSS and JavaScript.',
    wantsToLearn: 'Backend Development',
    availability: 'Weekends',
  },
  {
    id: 6,
    name: 'Digital Illustration',
    category: 'Design',
    level: 'Intermediate',
    teacher: 'Meera Joshi',
    emoji: '🖌️',
    description: 'Learn digital drawing, colour and illustration basics.',
    wantsToLearn: 'Animation',
    availability: 'Flexible',
  },
];

const categories = [
  'All Skills',
  'Technology',
  'Design',
  'Communication',
  'Creative',
];

export default function App() {
  const auth = useAuth();

  const user = auth.isAuthenticated
    ? {
        name:
          auth.user?.profile?.name ||
          auth.user?.profile?.email?.split('@')[0] ||
          'Member',
        email: auth.user?.profile?.email || '',
        sub: auth.user?.profile?.sub || '',
      }
    : null;

  const [skills, setSkills] = useState(initialSkills);
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All Skills');
  const [showForm, setShowForm] = useState(false);
  const [requests, setRequests] = useState([]);
  const [notice, setNotice] = useState('');
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [deletingRequestId, setDeletingRequestId] = useState(null);
  const [sendingRequest, setSendingRequest] = useState(false);

  const formRef = useRef(null);

  useEffect(() => {
    setAccessTokenGetter(() => auth.user?.access_token || null);
  }, [auth.user?.access_token]);

  useEffect(() => {
    let active = true;

    if (!auth.isAuthenticated || !auth.user?.access_token) {
      setLoadingSkills(false);
      setSkills(initialSkills);
      setRequests([]);

      return () => {
        active = false;
      };
    }

    setLoadingSkills(true);

    async function loadData() {
      try {
        const [remoteSkills, remoteRequests] = await Promise.all([
          getSkills(),
          getRequests(),
        ]);

        if (!active) return;

        const savedSkills = (remoteSkills || [])
          .filter((skill) => skill.entityType === 'SKILL')
          .map((skill) => ({
            ...skill,
            skillId: String(skill.skillId || ''),
            id: String(skill.skillId || skill.id || skill.PK || ''),
            emoji: skill.emoji || '✨',
            teacher: skill.teacher || 'Community Member',
            wantsToLearn: skill.wantsToLearn || '',
            availability: skill.availability || 'Flexible',
          }))
          .filter((skill) => Boolean(skill.skillId))
          .filter((skill) => {
            const name = (skill.name || '').trim().toLowerCase();
            return name !== 'web dev' && name !== 'website developer';
          })
          .filter(
            (savedSkill) =>
              !initialSkills.some(
                (sample) =>
                  sample.name.toLowerCase() ===
                    (savedSkill.name || '').toLowerCase() &&
                  sample.teacher.toLowerCase() ===
                    (savedSkill.teacher || '').toLowerCase()
              )
          );

        setSkills([...initialSkills, ...savedSkills]);
        setRequests(remoteRequests || []);
      } catch (error) {
        console.error('Could not load SkillBridge data:', error);

        if (active) {
          setNotice(
            error.message ||
              'Could not connect to AWS. Please try again.'
          );
        }
      } finally {
        if (active) setLoadingSkills(false);
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [auth.isAuthenticated, auth.user?.access_token]);

  useEffect(() => {
    if (auth.isAuthenticated) {
      setShowAuth(false);

      const name =
        auth.user?.profile?.name ||
        auth.user?.profile?.email?.split('@')[0] ||
        'Member';

      setNotice(`Welcome to SkillBridge, ${name}!`);
    }
  }, [auth.isAuthenticated]);

  useEffect(() => {
    if (!showForm) return;

    const scrollTimer = window.setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 100);

    return () => window.clearTimeout(scrollTimer);
  }, [showForm]);

  const filteredSkills = useMemo(() => {
    return skills.filter((skill) => {
      const searchableText = [
        skill.name,
        skill.teacher,
        skill.description,
        skill.wantsToLearn || '',
        skill.category,
      ]
        .join(' ')
        .toLowerCase();

      const matchesSearch = searchableText.includes(
        search.toLowerCase().trim()
      );

      const matchesCategory =
        category === 'All Skills' || skill.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [skills, search, category]);

  function openLogin() {
    setAuthMode('login');
    setShowAuth(true);
    setNotice('');
  }

  function openSignup() {
    setAuthMode('signup');
    setShowAuth(true);
    setNotice('');
  }

  async function handleLogout() {
    try {
      await auth.signoutRedirect();
    } catch (error) {
      console.error('Cognito logout failed:', error);
      setNotice('Could not log out. Please try again.');
    }
  }
  
  async function addSkill(event) {
    event.preventDefault();

    if (!user) {
      openLogin();
      setNotice('Please log in before sharing a skill.');
      return;
    }

    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const description = String(data.get('description') || '').trim();

    if (!name) {
      setNotice('Please enter a skill name.');
      return;
    }

    const skillToSave = {
      name,
      category: String(data.get('category') || 'Technology'),
      level: String(data.get('level') || 'Beginner'),
      teacher: user.name,
      description:
        description ||
        'Ready to share this skill with fellow learners.',
      wantsToLearn: '',
      availability: 'Flexible',
    };

    try {
      const savedSkill = await saveSkill(skillToSave);

      if (!savedSkill?.skillId) {
        throw new Error(
          'Skill was saved, but the server did not return a skill ID.'
        );
      }

      const newSkill = {
        ...savedSkill,
        skillId: String(savedSkill.skillId),
        id: String(savedSkill.skillId),
        emoji: savedSkill.emoji || '✨',
      };

      setSkills((previousSkills) => [newSkill, ...previousSkills]);
      setSearch('');
      setCategory('All Skills');
      form.reset();
      setShowForm(false);
      setNotice('Your skill was saved to AWS successfully!');
    } catch (error) {
      console.error('Could not save skill:', error);
      setNotice(
        error.message || 'Could not save skill. Please try again.'
      );
    }
  }

  async function sendRequest(skill) {
    console.log('1. sendRequest started', skill);

    if (sendingRequest) return;

    if (!auth.isAuthenticated || !auth.user?.access_token) {
      setNotice('Please log in to request this skill.');
      openLogin();
      return;
    }

    const skillId = skill?.skillId
      ? String(skill.skillId)
      : '';

    if (!skillId) {
      setNotice(
        'This is a sample skill, not a saved AWS skill. Publish a skill first to test requests.'
      );
      return;
    }

    const alreadyRequested = requests.some(
      (request) => String(request.skillId) === skillId
    );

    if (alreadyRequested) {
      setNotice('You already requested this skill.');
      return;
    }

    setSendingRequest(true);
    setNotice('Sending your learning request...');

    try {
      console.log('2. About to call saveRequest');

      const savedRequest = await saveRequest({
        skillId,
        skillName: skill.name,
        message: '',
      });

      if (!savedRequest?.requestId) {
        throw new Error(
          'The server did not return a request ID. Please check the Lambda response.'
        );
      }

      setRequests((previousRequests) => [
        ...previousRequests,
        {
          ...savedRequest,
          skillId,
          skillName: savedRequest.skillName || skill.name,
          emoji: skill.emoji || '✨',
          teacher: savedRequest.teacher || skill.teacher,
          status: savedRequest.status || 'Pending',
        },
      ]);

      setNotice(`Request sent for ${skill.name}!`);
      setSelectedSkill(null);
    } catch (error) {
      console.error('Request to Learn failed:', error);
      setNotice(
        error.message ||
          'Could not send your request. Please try again.'
      );
    } finally {
      setSendingRequest(false);
    }
  }

  async function handleDeleteRequest(request) {
    const requestId = request.requestId;

    if (!requestId) {
      setNotice(
        'This request has no request ID. Refresh the page and try again.'
      );
      return;
    }

    const confirmed = window.confirm(
      `Delete your learning request for "${request.skillName}"?`
    );

    if (!confirmed) return;

    setDeletingRequestId(requestId);

    try {
      await removeRequest(requestId);

      setRequests((previousRequests) =>
        previousRequests.filter(
          (item) => item.requestId !== requestId
        )
      );

      setNotice('Learning request deleted successfully.');
    } catch (error) {
      console.error('Could not delete learning request:', error);
      setNotice(
        error.message ||
          'Could not delete the learning request. Please try again.'
      );
    } finally {
      setDeletingRequestId(null);
    }
  }

  async function handleDeleteSkill(skill) {
    if (!skill.skillId) {
      setNotice('Original sample skills cannot be deleted.');
      return;
    }

    if (!user || skill.teacher !== user.name) {
      setNotice('You can only delete skills you added.');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${skill.name}"?`
    );

    if (!confirmed) return;

    try {
      await removeSkill(skill.skillId);

      setSkills((previousSkills) =>
        previousSkills.filter(
          (item) => item.skillId !== skill.skillId
        )
      );

      setSelectedSkill((previousSkill) =>
        previousSkill?.skillId === skill.skillId
          ? null
          : previousSkill
      );

      setNotice(`"${skill.name}" was deleted successfully.`);
    } catch (error) {
      console.error('Could not delete skill:', error);
      setNotice(
        error.message || 'Could not delete skill. Please try again.'
      );
    }
  }

  if (showAuth) {
    return (
      <Auth
        initialMode={authMode}
        onBack={() => setShowAuth(false)}
      />
    );
  }

  return (
    <div className="app-shell">
      <header className="navbar">
        <a
          className="brand"
          href="#"
          onClick={(event) => {
            event.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <span className="brand-mark">S</span>
          SkillBridge<span className="brand-dot">.</span>
        </a>

        <nav>
          <a className="nav-active" href="#explore">
            Explore skills
          </a>

          <a href="#requests">
            My requests{' '}
            <span className="request-count">{requests.length}</span>
          </a>
        </nav>

        <div className="nav-actions">
          {user ? (
            <>
              <span className="nav-user">
                Hi, {user.name.split(' ')[0]}!
              </span>

              <button
                type="button"
                className="button nav-button"
                onClick={handleLogout}
              >
                Logout
              </button>

              <button
                type="button"
                className="button button-primary nav-button"
                onClick={() => {
                  setNotice('');
                  setShowForm(true);
                }}
              >
                + Share a skill
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="button nav-button"
                onClick={openLogin}
              >
                Login
              </button>

              <button
                type="button"
                className="button button-primary nav-button"
                onClick={openSignup}
              >
                Sign up
              </button>

              <button
                type="button"
                className="button button-primary nav-button"
                onClick={openLogin}
              >
                + Share a skill
              </button>
            </>
          )}
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-content">
            <div className="eyebrow">
              <span className="live-dot" /> LEARN TOGETHER. GROW TOGETHER.
            </div>

            <h1>
              Your skills can
              <br />
              take someone <span>further.</span>
            </h1>

            <p>
              Meet people who know what you want to learn. Share what you
              know, discover something new, and grow together.
            </p>

            <a href="#explore" className="button button-primary hero-button">
              Explore the community <span>↗</span>
            </a>

            <div className="hero-proof">
              <span className="proof-avatars">A P R M</span>
              <span>Built on sharing knowledge</span>
            </div>
          </div>

          <div className="hero-art">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />

            <div className="hero-orb">
              <span>✳</span>
            </div>

            <div className="float-card float-card-top">
              <span>💡</span>
              <div>
                <strong>Learn something new</strong>
                <small>One skill at a time</small>
              </div>
            </div>

            <div className="float-card float-card-bottom">
              <span>🤝</span>
              <div>
                <strong>Share what you know</strong>
                <small>Everyone has something to teach</small>
              </div>
            </div>

            <span className="spark spark-one">✦</span>
            <span className="spark spark-two">✧</span>
          </div>
        </section>

        <section className="stats">
          <div>
            <strong>{skills.length.toString().padStart(2, '0')}</strong>
            <span>Skills to explore</span>
          </div>

          <div>
            <strong>
              {new Set(skills.map((skill) => skill.teacher))
                .size.toString()
                .padStart(2, '0')}
            </strong>
            <span>Community mentors</span>
          </div>

          <div>
            <strong>{requests.length.toString().padStart(2, '0')}</strong>
            <span>Your requests</span>
          </div>

          <div>
            <strong>∞</strong>
            <span>Things to learn</span>
          </div>
        </section>

        {showForm && (
          <section className="form-panel" id="add-skill" ref={formRef}>
            <div className="section-heading">
              <div>
                <span className="eyebrow">GIVE KNOWLEDGE A HOME</span>
                <h2>Share a skill</h2>
              </div>

              <button
                type="button"
                className="icon-button"
                aria-label="Close share skill form"
                onClick={() => setShowForm(false)}
              >
                ✕
              </button>
            </div>

            <form className="skill-form" onSubmit={addSkill}>
              <label>
                Skill name
                <input
                  name="name"
                  placeholder="e.g. Java programming"
                  required
                  maxLength={70}
                />
              </label>

              <label>
                Category
                <select name="category" defaultValue="Technology">
                  {categories.slice(1).map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Experience level
                <select name="level" defaultValue="Beginner">
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </label>

              <label className="full-field">
                Description
                <textarea
                  name="description"
                  placeholder="What can someone learn from you?"
                  rows={3}
                  maxLength={250}
                />
              </label>

              <button className="button button-primary" type="submit">
                Publish skill ↗
              </button>
            </form>
          </section>
        )}

        {notice && (
          <div className="notice" role="status">
            <span>{notice}</span>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => setNotice('')}
            >
              ✕
            </button>
          </div>
        )}

        <section className="explore-section" id="explore">
          <div className="section-heading">
            <div>
              <span className="eyebrow">
                YOUR NEXT CHAPTER STARTS HERE
              </span>
              <h2>
                Find your next <span>skill.</span>
              </h2>
              <p>Small steps. New skills. Unexpected connections.</p>
            </div>
          </div>

          <div className="search-row">
            <div className="search-box">
              <span>⌕</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search skills, people, or interests..."
                aria-label="Search skills"
              />
              <kbd>SEARCH</kbd>
            </div>
          </div>

          <div className="category-row">
            {categories.map((item) => (
              <button
                type="button"
                key={item}
                onClick={() => setCategory(item)}
                className={`category-chip ${
                  category === item ? 'selected' : ''
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {loadingSkills && <p role="status">Loading skills…</p>}

          <div className="skill-grid">
            {filteredSkills.map((skill, index) => (
              <article
                className="skill-card skill-card-clickable"
                key={skill.skillId || skill.id}
                style={{ '--card-index': index }}
                onClick={() => setSelectedSkill(skill)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setSelectedSkill(skill);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div className={`skill-visual visual-${index % 4}`}>
                  <span className="skill-emoji">{skill.emoji}</span>
                  <span className="level-tag">{skill.level}</span>
                </div>

                <div className="skill-body">
                  <span className="skill-category">{skill.category}</span>
                  <h3>{skill.name}</h3>
                  <p>{skill.description}</p>

                  <p className="skill-detail">
                    Wants to learn:{' '}
                    {skill.wantsToLearn || 'Open to suggestions'}
                  </p>

                  <p className="skill-detail">
                    Available: {skill.availability || 'Flexible'}
                  </p>

                  <div className="skill-footer">
                    <div className="teacher-avatar">
                      {skill.teacher.charAt(0)}
                    </div>

                    <div className="teacher-info">
                      <strong>{skill.teacher}</strong>
                      <small>Community member</small>
                    </div>

                    <button
                      type="button"
                      className="request-button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedSkill(skill);
                      }}
                      aria-label={`View details for ${skill.name}`}
                    >
                      ↗
                    </button>

                    {skill.skillId &&
                      user &&
                      skill.teacher === user.name && (
                        <button
                          type="button"
                          className="button nav-button"
                          style={{
                            padding: '7px 10px',
                            fontSize: '11px',
                          }}
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDeleteSkill(skill);
                          }}
                        >
                          Delete
                        </button>
                      )}
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filteredSkills.length === 0 && (
            <div className="empty-state">
              <span>⌕</span>
              <h3>No skills found</h3>
              <p>Try another search or category.</p>

              <button
                type="button"
                className="button button-primary"
                onClick={() => {
                  setSearch('');
                  setCategory('All Skills');
                }}
              >
                Clear filters
              </button>
            </div>
          )}
        </section>

        <section className="requests-section" id="requests">
          <div className="section-heading">
            <div>
              <span className="eyebrow">YOUR LEARNING JOURNEY</span>
              <h2>
                My <span>exchange requests.</span>
              </h2>
              <p>Track the skills you have requested to learn.</p>
            </div>
          </div>

          {requests.length === 0 ? (
            <div className="empty-requests">
              <span>✳</span>
              <div>
                <strong>
                  Your next connection starts with a request.
                </strong>
                <p>
                  Explore a skill above and request to learn from its mentor.
                </p>
              </div>
            </div>
          ) : (
            <div className="request-list">
              {requests.map((request, index) => (
                <div
                  className="request-item"
                  key={
                    request.requestId ||
                    request.PK ||
                    `${request.skillId}-${index}`
                  }
                >
                  <div className="teacher-avatar">
                    {(request.teacher || 'M').charAt(0)}
                  </div>

                  <div className="request-details">
                    <strong>{request.skillName}</strong>
                    <small>Learning from {request.teacher}</small>
                  </div>

                  <span className="pending-status">
                    {request.status || 'Pending'}
                  </span>

                  <button
                    type="button"
                    className="button nav-button"
                    style={{
                      padding: '8px 11px',
                      fontSize: '11px',
                    }}
                    disabled={
                      !request.requestId ||
                      deletingRequestId === request.requestId
                    }
                    onClick={() => handleDeleteRequest(request)}
                  >
                    {deletingRequestId === request.requestId
                      ? 'Deleting...'
                      : 'Delete'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {selectedSkill && (
          <div
            className="skill-modal-overlay"
            onClick={() => {
              if (!sendingRequest) setSelectedSkill(null);
            }}
          >
            <div
              className="skill-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="skill-modal-title"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="skill-modal-close"
                aria-label="Close skill details"
                disabled={sendingRequest}
                onClick={() => setSelectedSkill(null)}
              >
                ✕
              </button>

              <div className="skill-modal-visual">
                <span>{selectedSkill.emoji}</span>
                <span className="level-tag">
                  {selectedSkill.level}
                </span>
              </div>

              <span className="skill-category">
                {selectedSkill.category}
              </span>

              <h2 id="skill-modal-title">
                {selectedSkill.name}
              </h2>

              <p>{selectedSkill.description}</p>

              <div className="skill-modal-details">
                <div>
                  <span>Mentor</span>
                  <strong>{selectedSkill.teacher}</strong>
                </div>

                <div>
                  <span>Experience level</span>
                  <strong>{selectedSkill.level}</strong>
                </div>

                <div>
                  <span>Availability</span>
                  <strong>
                    {selectedSkill.availability || 'Flexible'}
                  </strong>
                </div>

                <div>
                  <span>Wants to learn</span>
                  <strong>
                    {selectedSkill.wantsToLearn ||
                      'Open to suggestions'}
                  </strong>
                </div>
              </div>

              <div className="skill-modal-actions">
                <button
                  type="button"
                  className="button button-primary"
                  disabled={sendingRequest}
                  style={{
                    position: 'relative',
                    zIndex: 10,
                    pointerEvents: 'auto',
                    cursor: sendingRequest ? 'wait' : 'pointer',
                  }}
                  onClick={(event) => {
                    event.stopPropagation();
                    sendRequest(selectedSkill);
                  }}
                >
                  {sendingRequest
                    ? 'Sending...'
                    : 'Request to Learn ↗'}
                </button>

                <button
                  type="button"
                  className="button skill-modal-cancel"
                  disabled={sendingRequest}
                  onClick={() => setSelectedSkill(null)}
                >
                  Back to skills
                </button>

                {selectedSkill.skillId &&
                  user &&
                  selectedSkill.teacher === user.name && (
                    <button
                      type="button"
                      className="button"
                      style={{
                        background: '#49303a',
                        color: '#ffdce3',
                      }}
                      onClick={() =>
                        handleDeleteSkill(selectedSkill)
                      }
                    >
                      Delete This Skill
                    </button>
                  )}
              </div>
            </div>
          </div>
        )}

        <section className="bottom-cta">
          <span className="eyebrow">KNOW SOMETHING COOL?</span>
          <h2>
            Someone out there wants to learn{' '}
            <span>what you know.</span>
          </h2>
          <p>
            Your experience could be the beginning of someone else's next big
            thing.
          </p>

          <button
            type="button"
            className="button button-light"
            onClick={() => {
              if (!user) {
                openLogin();
                return;
              }

              setNotice('');
              setShowForm(true);
            }}
          >
            Share what you know ↗
          </button>
        </section>
      </main>

      <footer>
        <a
          className="brand"
          href="#"
          onClick={(event) => {
            event.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <span className="brand-mark">S</span>
          SkillBridge<span className="brand-dot">.</span>
        </a>

        <p>Made for curious minds. Built on shared knowledge.</p>
        <span>© {new Date().getFullYear()} SkillBridge</span>
      </footer>
    </div>
  );
}
