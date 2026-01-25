import Header from '../components/Header';
import { Link } from 'react-router-dom';
import {
    TrendingDown, CheckCircle, TrendingUp, AlertTriangle,
    Calculator, BarChart3, UserCheck, MessageCircle, Video, Lightbulb,
    MessageSquare
} from 'lucide-react';

const imtCategories = [
    {
        key: 'kurus',
        title: 'Kurus',
        range: 'IMT < 18.5',
        icon: TrendingDown,
        description: 'Berat badan kurang dari normal'
    },
    {
        key: 'normal',
        title: 'Normal',
        range: 'IMT 18.5 - 24.9',
        icon: CheckCircle,
        description: 'Berat badan ideal'
    },
    {
        key: 'overweight',
        title: 'Overweight',
        range: 'IMT 25 - 29.9',
        icon: TrendingUp,
        description: 'Kelebihan berat badan'
    },
    {
        key: 'obesitas',
        title: 'Obesitas',
        range: 'IMT ≥ 30',
        icon: AlertTriangle,
        description: 'Obesitas memerlukan penanganan'
    }
];

const features = [
    {
        icon: Calculator,
        title: 'Kalkulator IMT Otomatis',
        description: 'Hitung IMT Anda secara instan dan dapatkan rekomendasi yang tepat'
    },
    {
        icon: BarChart3,
        title: 'Grafik Progres IMT',
        description: 'Pantau perkembangan berat badan Anda dengan visualisasi yang menarik'
    },
    {
        icon: UserCheck,
        title: 'Pelatih Profesional',
        description: 'Didampingi pelatih berpengalaman untuk mencapai target Anda'
    },
    {
        icon: MessageCircle,
        title: 'Konsultasi Real-time',
        description: 'Konsultasi langsung dengan pelatih kapan saja dan di mana saja'
    },
    {
        icon: Video,
        title: 'Video Latihan',
        description: 'Akses ratusan video latihan yang bisa diikuti dari rumah'
    },
    {
        icon: Lightbulb,
        title: 'Rekomendasi Personal',
        description: 'Dapatkan program latihan yang disesuaikan dengan kondisi Anda'
    }
];

export default function LandingPage() {
    return (
        <div className="landing">
            <Header />

            {/* Hero Section */}
            <section className="landing-hero container">
                <h1>PEVITA - Pelatih Virtual Fitness</h1>
                <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Puskesmas Bugangan</p>
                <p>
                    Kenali kategori Indeks Massa Tubuh (IMT) Anda dan mulai perjalanan menuju tubuh yang lebih sehat
                </p>
            </section>

            {/* IMT Categories */}
            <section className="imt-section container">
                <div className="imt-grid">
                    {imtCategories.map(cat => (
                        <div key={cat.key} className={`imt-card ${cat.key}`}>
                            <div className="imt-icon">
                                <cat.icon size={36} />
                            </div>
                            <h3>{cat.title}</h3>
                            <p className="imt-range">{cat.range}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="container">
                    <h2 className="section-title">Fitur Unggulan</h2>
                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <div key={index} className="feature-card">
                                <div className="feature-icon">
                                    <feature.icon size={28} color="white" />
                                </div>
                                <div className="feature-content">
                                    <h3>{feature.title}</h3>
                                    <p>{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section container">
                <div className="cta-box">
                    <h2>Siap Memulai Perjalanan Kebugaran Anda?</h2>
                    <p>Bergabunglah dengan ribuan member yang telah merasakan manfaat dari program kami</p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <a
                            href="https://wa.me/6281234567890"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-success"
                        >
                            <MessageSquare size={20} />
                            Hubungi via WhatsApp
                        </a>
                        <Link to="/login" className="btn btn-primary">
                            Mulai Sekarang
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
