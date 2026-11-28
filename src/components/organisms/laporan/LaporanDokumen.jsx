import { useState } from 'react'
import { formatBobot, formatDesimal, formatRt, formatTanggal, formatTanggalPanjang } from '../../../lib/format.js'
import { SIFAT } from '../../../lib/kriteria.js'
import { ATURAN_SERI } from '../../../lib/perhitungan.js'

const STATUS_PERIODE = {
  open: 'Dibuka',
  closed: 'Ditutup',
  final: 'Final',
}

const TH = 'border border-border px-2 py-1.5 text-left font-semibold'
const TD = 'border border-border px-2 py-1.5'

function Info({ label, children }) {
  return (
    <div className="flex gap-2">
      <dt className="w-32 shrink-0 text-fg-muted sm:w-40">{label}</dt>
      <dd className="font-medium">: {children}</dd>
    </div>
  )
}

// Official ranking report of one SAW run (Laporan Akhir §3.4.1 Gambar 3.4, §4.1.3 Gambar 4.29):
// ranking, No. KK, wilayah RT/RW, nilai V and keputusan, ready to be signed by the Kepala Desa.
// On screen it looks like a sheet of paper; printed (Ctrl+P → Save as PDF) it fills the A4 page.
export default function LaporanDokumen({ perhitungan }) {
  const { periode, hasil, kriteria } = perhitungan
  const totalBobot = kriteria.reduce((sum, k) => sum + k.bobot, 0)
  const adaSeri = hasil.some((h) => h.seri)
  // Date on the document: when the report was opened (stable across re-renders)
  const [dicetak] = useState(() => new Date())

  return (
    <article
      className={`mx-auto max-w-4xl rounded-xl border border-border bg-surface p-5 text-sm shadow-sm sm:p-12
        print:max-w-none print:rounded-none print:border-0 print:p-0 print:text-xs print:shadow-none`}
    >
      <header className="border-b-2 border-fg pb-4 text-center">
        <p className="text-xs font-semibold tracking-widest text-fg-muted uppercase">
          Sistem Pendukung Keputusan Penerima Bantuan Sosial
        </p>
        <h1 className="mt-2 text-lg font-bold uppercase">Laporan Hasil Perangkingan Penerima Bantuan Sosial</h1>
        <p className="mt-1">Metode Simple Additive Weighting (SAW)</p>
      </header>

      <dl className="mt-6 grid gap-x-8 gap-y-1.5 sm:grid-cols-2 print:grid-cols-2">
        <Info label="Periode">
          {periode.nama} ({periode.tahun})
        </Info>
        <Info label="Status periode">{STATUS_PERIODE[periode.status]}</Info>
        <Info label="Kuota penerima">{periode.kuota} KK</Info>
        <Info label="KK dinilai">{perhitungan.jumlahAlternatif} KK (survei terverifikasi)</Info>
        <Info label="Tanggal perhitungan">{formatTanggal(perhitungan.executedAt)}</Info>
        <Info label="Dihitung oleh">{perhitungan.executedBy.nama}</Info>
      </dl>

      <section className="mt-8">
        <h2 className="font-bold">A. Daftar Peringkat Kelayakan</h2>
        <div className="mt-3 overflow-x-auto print:overflow-visible">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-surface-alt">
              <th className={`${TH} w-14 text-center`}>Rank</th>
              <th className={TH}>No. KK</th>
              <th className={TH}>Kepala Keluarga</th>
              <th className={TH}>Wilayah</th>
              <th className={`${TH} text-right`}>Nilai V</th>
              <th className={TH}>Keputusan</th>
            </tr>
          </thead>
          <tbody>
            {hasil.map((h) => (
              <tr
                key={h.kk.id}
                className="break-inside-avoid"
              >
                <td className={`${TD} text-center font-semibold`}>{h.ranking}</td>
                <td className={`${TD} font-mono`}>{h.kk.noKk}</td>
                <td className={TD}>{h.kk.kepalaKeluarga}</td>
                <td className={`${TD} whitespace-nowrap`}>{formatRt(h.kk.rt)}</td>
                <td className={`${TD} text-right font-mono`}>{formatDesimal(h.nilaiV)}</td>
                <td className={`${TD} whitespace-nowrap ${h.layak ? 'font-semibold' : 'text-fg-muted'}`}>
                  {h.layak ? 'Layak' : 'Tidak Layak'}
                  {h.seri && '*'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        <p className="mt-2 text-xs text-fg-muted">
          KK pada peringkat 1 sampai {periode.kuota} sesuai kuota periode dinyatakan Layak menerima bantuan.
          {adaSeri && ` * Nilai V sama dengan KK lain. ${ATURAN_SERI}`}
        </p>
      </section>

      <section className="mt-8 break-inside-avoid">
        <h2 className="font-bold">B. Kriteria dan Bobot Penilaian</h2>
        <div className="mt-3 overflow-x-auto print:overflow-visible">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-surface-alt">
              <th className={`${TH} w-16`}>Kode</th>
              <th className={TH}>Kriteria</th>
              <th className={TH}>Sifat</th>
              <th className={`${TH} text-right`}>Bobot (W)</th>
            </tr>
          </thead>
          <tbody>
            {kriteria.map((k) => (
              <tr key={k.kode}>
                <td className={`${TD} font-semibold`}>{k.kode}</td>
                <td className={TD}>{k.nama}</td>
                <td className={TD}>{SIFAT[k.sifat].label}</td>
                <td className={`${TD} text-right font-mono`}>{formatBobot(k.bobot)}</td>
              </tr>
            ))}
            <tr className="font-semibold">
              <td
                className={TD}
                colSpan={3}
              >
                Total
              </td>
              <td className={`${TD} text-right font-mono`}>{formatBobot(totalBobot)}</td>
            </tr>
          </tbody>
        </table>
        </div>
        <p className="mt-2 text-xs text-fg-muted">
          Normalisasi: benefit r = x / max(x), cost r = min(x) / x. Nilai preferensi V = Σ (w × r); nilai V
          terbesar menempati peringkat 1.
        </p>
      </section>

      <section className="mt-12 break-inside-avoid text-center">
        {/* Place (filled in by hand) and date, above the Kepala Desa column */}
        <div className="grid grid-cols-2 gap-6 sm:gap-8">
          <p className="col-start-2">
            <span className="inline-block w-20 border-b border-dotted border-fg align-bottom sm:w-28" />,{' '}
            {formatTanggalPanjang(dicetak)}
          </p>
        </div>
        <div className="mt-1 grid grid-cols-2 gap-6 sm:gap-8">
          <div>
            <p>Dibuat oleh,</p>
            <p>Perangkat Desa</p>
            <div className="h-20" />
            <p className="font-semibold underline">{perhitungan.executedBy.nama}</p>
          </div>
          <div>
            <p>Mengetahui,</p>
            <p>Kepala Desa</p>
            <div className="h-20" />
            {/* Name and signature of the Kepala Desa, written by hand */}
            <p className="flex items-end justify-center gap-1">
              (<span className="inline-block w-full max-w-48 border-b border-dotted border-fg" />)
            </p>
          </div>
        </div>
      </section>

      <footer className="mt-10 border-t border-border pt-3 text-xs text-fg-muted">
        Dokumen ini dihasilkan oleh SPK Bansos pada {formatTanggal(dicetak)}. Rincian perhitungan setiap KK (nilai X,
        normalisasi r, bobot, dan nilai V) tersimpan pada sistem dan dapat dibuka pada menu Hasil Perangkingan.
      </footer>
    </article>
  )
}
