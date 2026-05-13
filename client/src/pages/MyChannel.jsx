import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import './MyChannel.css';

export function MyChannel() {
  const { loading } = useAuth();
  const navigate = useNavigate();
  const [channels, setChannels] = useState([]);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [err, setErr] = useState('');

  async function load() {
    const { data } = await api.get('/api/channels/mine');
    setChannels(data);
  }

  useEffect(() => {
    if (!loading) {
      load().catch(() => setChannels([]));
    }
  }, [loading]);

  async function create(e) {
    e.preventDefault();
    setErr('');
    try {
      const { data: newChannel } = await api.post('/api/channels', { channelName: name, description: desc });
      setName('');
      setDesc('');
      navigate(`/channel/${newChannel.id}`);
    } catch (ex) {
      setErr(ex.response?.data?.message || 'Could not create channel');
    }
  }

  if (loading) {
    return <p className="yt-muted">Loading…</p>;
  }

  return (
    <div className="my-ch">
      <h1>Your channel</h1>
      <p className="my-ch__lead">Create a channel to upload videos. You can manage videos from the channel page.</p>

      <section className="my-ch__create">
        <h2>Create channel</h2>
        {err && <div className="my-ch__err">{err}</div>}
        <form onSubmit={create} className="my-ch__form">
          <input
            className="my-ch__input"
            placeholder="Channel name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <textarea
            className="my-ch__textarea"
            placeholder="Description"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={3}
          />
          <button type="submit" className="my-ch__btn">
            Create
          </button>
        </form>
      </section>

      <section>
        <h2>Your channels</h2>
        {channels.length === 0 ? (
          <p className="yt-muted">No channels yet.</p>
        ) : (
          <ul className="my-ch__list">
            {channels.map((c) => (
              <li key={c.id}>
                <Link to={`/channel/${c.id}`}>{c.channelName}</Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
