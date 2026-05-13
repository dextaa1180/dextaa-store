import { ArrowRight, Lock, Mail, ShieldCheck, UserRound } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import toastr from 'toastr'

type AuthMode = 'login' | 'register' | 'admin'

type AuthPageProps = {
  mode: AuthMode
}

const authCopy = {
  login: {
    kicker: 'Akun Pelanggan',
    title: 'Masuk ke DextaaStore',
    description: 'Pantau pesanan, simpan kontak checkout, dan kelola riwayat transaksi dari satu akun.',
    button: 'Masuk',
  },
  register: {
    kicker: 'Daftar Akun',
    title: 'Buat Akun Pelanggan',
    description: 'Buat akun untuk checkout lebih cepat dan akses riwayat pesanan saat backend aktif.',
    button: 'Daftar',
  },
  admin: {
    kicker: 'Admin Dashboard',
    title: 'Masuk Admin',
    description: 'Area ini untuk mengelola produk, pesanan, reviews, banner, dan laporan pelanggan.',
    button: 'Masuk Dashboard',
  },
}

export function AuthPage({ mode }: AuthPageProps) {
  const copy = authCopy[mode]
  const isRegister = mode === 'register'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isRegister && !name.trim()) {
      toastr.warning('Masukkan nama lengkap terlebih dahulu.')
      return
    }

    if (!email.trim() || !password.trim()) {
      toastr.warning('Masukkan email dan password terlebih dahulu.')
      return
    }

    if (isRegister && !whatsapp.trim()) {
      toastr.warning('Masukkan nomor WhatsApp terlebih dahulu.')
      return
    }

    setSubmitting(true)

    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name,
          email,
          whatsapp,
          password,
          role: mode === 'admin' ? 'ADMIN' : undefined,
        }),
      })
      const payload = await response.json()

      if (!response.ok) {
        toastr.error(payload.message ?? 'Autentikasi gagal.')
        return
      }

      toastr.success(isRegister ? 'Akun berhasil dibuat.' : 'Login berhasil.')
      window.location.href = payload.user.role === 'ADMIN' ? '/admin/dashboard' : '/'
    } catch {
      toastr.error('API login belum aktif atau tidak dapat dihubungi.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className={mode === 'admin' ? 'auth-main auth-main-admin' : 'auth-main'}>
      <section className="auth-card section-surface" aria-labelledby="auth-title">
        <div className="auth-copy">
          <span className="auth-kicker">
            {mode === 'admin' ? <ShieldCheck size={17} /> : <UserRound size={17} />}
            {copy.kicker}
          </span>
          <h1 id="auth-title">{copy.title}</h1>
          <p>{copy.description}</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {isRegister && (
            <label>
              <span>Nama Lengkap</span>
              <div className="auth-field">
                <UserRound size={18} />
                <input
                  placeholder="Nama anda"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>
            </label>
          )}

          <label>
            <span>Email</span>
            <div className="auth-field">
              <Mail size={18} />
              <input
                inputMode="email"
                placeholder={mode === 'admin' ? 'admin@dextaastore.id' : 'email@contoh.com'}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
          </label>

          {isRegister && (
            <label>
              <span>No. WhatsApp</span>
              <div className="auth-field">
                <UserRound size={18} />
                <input
                  inputMode="tel"
                  placeholder="08xxxx"
                  value={whatsapp}
                  onChange={(event) => setWhatsapp(event.target.value)}
                />
              </div>
            </label>
          )}

          <label>
            <span>Password</span>
            <div className="auth-field">
              <Lock size={18} />
              <input
                placeholder="Password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
          </label>

          <button type="submit" disabled={submitting}>
            {submitting ? 'Memproses...' : copy.button}
            <ArrowRight size={18} />
          </button>

          <div className="auth-links">
            {mode === 'login' && <a href="/register">Belum punya akun? Daftar</a>}
            {mode === 'register' && <a href="/login">Sudah punya akun? Masuk</a>}
            {mode !== 'admin' && <a href="/admin/login">Masuk sebagai admin</a>}
            {mode === 'admin' && <a href="/login">Kembali ke login pelanggan</a>}
          </div>
        </form>
      </section>
    </main>
  )
}
