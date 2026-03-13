-- SpellBloc Education Platform Database Schema
-- PostgreSQL with Prisma ORM

-- Users table (parents and teachers)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255), -- nullable for OAuth users
    role VARCHAR(20) NOT NULL CHECK (role IN ('parent', 'teacher', 'admin')),
    google_id VARCHAR(255) UNIQUE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    subscription_type VARCHAR(20) DEFAULT 'free' CHECK (subscription_type IN ('free', 'premium', 'school')),
    subscription_expires_at TIMESTAMP,
    privacy_consent BOOLEAN DEFAULT FALSE,
    marketing_consent BOOLEAN DEFAULT FALSE
);

-- Children profiles
CREATE TABLE children (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 2 AND age <= 12),
    avatar VARCHAR(255), -- URL to avatar image
    grade_level VARCHAR(20),
    language_preference VARCHAR(10) DEFAULT 'en',
    accessibility_settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    total_playtime INTEGER DEFAULT 0, -- in minutes
    current_level INTEGER DEFAULT 1,
    total_stars INTEGER DEFAULT 0
);

-- Custodial wallets (Web3 backend)
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    child_id UUID REFERENCES children(id) ON DELETE CASCADE,
    wallet_address VARCHAR(42) NOT NULL UNIQUE,
    encrypted_private_key TEXT NOT NULL,
    chain VARCHAR(20) DEFAULT 'celo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    nonce INTEGER DEFAULT 0,
    CONSTRAINT wallet_owner_check CHECK (
        (user_id IS NOT NULL AND child_id IS NULL) OR 
        (user_id IS NULL AND child_id IS NOT NULL)
    )
);

-- Game sessions tracking
CREATE TABLE game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL, -- vowels, consonants, animals, etc.
    difficulty_level DECIMAL(3,1) DEFAULT 1.0,
    words_attempted INTEGER DEFAULT 0,
    words_correct INTEGER DEFAULT 0,
    words_wrong INTEGER DEFAULT 0,
    score INTEGER DEFAULT 0,
    stars_earned INTEGER DEFAULT 0,
    session_duration INTEGER, -- in seconds
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    game_mode VARCHAR(20) DEFAULT 'classic',
    language VARCHAR(10) DEFAULT 'en',
    device_type VARCHAR(20), -- mobile, tablet, desktop
    session_data JSONB DEFAULT '{}' -- detailed session analytics
);

-- Word mastery tracking
CREATE TABLE word_mastery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    word VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    mastery_level INTEGER DEFAULT 0 CHECK (mastery_level >= 0 AND mastery_level <= 5),
    attempts INTEGER DEFAULT 0,
    correct_attempts INTEGER DEFAULT 0,
    first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    next_review TIMESTAMP,
    difficulty_rating DECIMAL(3,1) DEFAULT 1.0,
    UNIQUE(child_id, word)
);

-- Achievement definitions
CREATE TABLE achievement_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    requirement_type VARCHAR(50) NOT NULL, -- words_mastered, sessions_completed, streak, etc.
    requirement_value INTEGER NOT NULL,
    badge_image_url VARCHAR(500),
    nft_metadata_uri VARCHAR(500),
    rarity VARCHAR(20) DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User achievements
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    achievement_type_id UUID NOT NULL REFERENCES achievement_types(id),
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    nft_minted BOOLEAN DEFAULT FALSE,
    nft_token_id BIGINT,
    nft_transaction_hash VARCHAR(66),
    blockchain_verified BOOLEAN DEFAULT FALSE,
    metadata_uri VARCHAR(500),
    UNIQUE(child_id, achievement_type_id)
);

-- Learning certificates
CREATE TABLE certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    certificate_type VARCHAR(100) NOT NULL, -- level_completion, mastery_milestone, etc.
    level VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    skills_demonstrated TEXT[],
    words_mastered INTEGER DEFAULT 0,
    accuracy_percentage DECIMAL(5,2),
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    certificate_hash VARCHAR(64) NOT NULL UNIQUE, -- SHA-256 hash
    blockchain_hash VARCHAR(66), -- transaction hash
    ipfs_hash VARCHAR(100), -- IPFS content hash
    pdf_url VARCHAR(500),
    is_verified BOOLEAN DEFAULT FALSE,
    verification_date TIMESTAMP
);

-- Leaderboards
CREATE TABLE leaderboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    leaderboard_type VARCHAR(50) NOT NULL, -- global, classroom, age_group
    period VARCHAR(20) NOT NULL, -- daily, weekly, monthly, all_time
    score INTEGER NOT NULL,
    rank INTEGER NOT NULL,
    words_mastered INTEGER DEFAULT 0,
    accuracy_percentage DECIMAL(5,2),
    total_playtime INTEGER DEFAULT 0,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    blockchain_verified BOOLEAN DEFAULT FALSE,
    UNIQUE(child_id, leaderboard_type, period, period_start)
);

-- Classrooms (for teachers)
CREATE TABLE classrooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    grade_level VARCHAR(20),
    subject VARCHAR(50) DEFAULT 'spelling',
    class_code VARCHAR(10) UNIQUE NOT NULL, -- for students to join
    max_students INTEGER DEFAULT 30,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    school_name VARCHAR(255),
    school_district VARCHAR(255)
);

-- Classroom students
CREATE TABLE classroom_students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(classroom_id, child_id)
);

-- Custom word lists (for teachers/parents)
CREATE TABLE word_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    classroom_id UUID REFERENCES classrooms(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
    words JSONB NOT NULL, -- array of word objects
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usage_count INTEGER DEFAULT 0
);

-- Learning analytics (for grant reporting)
CREATE TABLE learning_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    metric_type VARCHAR(50) NOT NULL, -- learning_velocity, retention_rate, etc.
    metric_value DECIMAL(10,4) NOT NULL,
    measurement_date DATE NOT NULL,
    age_at_measurement INTEGER NOT NULL,
    context_data JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(child_id, metric_type, measurement_date)
);

-- Blockchain transactions log
CREATE TABLE blockchain_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_hash VARCHAR(66) NOT NULL UNIQUE,
    transaction_type VARCHAR(50) NOT NULL, -- nft_mint, certificate_verify, leaderboard_update
    from_address VARCHAR(42) NOT NULL,
    to_address VARCHAR(42),
    contract_address VARCHAR(42) NOT NULL,
    token_id BIGINT,
    gas_used BIGINT,
    gas_price BIGINT,
    block_number BIGINT,
    block_timestamp TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, failed
    error_message TEXT,
    related_entity_type VARCHAR(50), -- achievement, certificate, leaderboard
    related_entity_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- IPFS content tracking
CREATE TABLE ipfs_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ipfs_hash VARCHAR(100) NOT NULL UNIQUE,
    content_type VARCHAR(50) NOT NULL, -- nft_metadata, certificate, image
    file_size BIGINT,
    mime_type VARCHAR(100),
    original_filename VARCHAR(255),
    related_entity_type VARCHAR(50),
    related_entity_id UUID,
    pinned BOOLEAN DEFAULT FALSE,
    pin_service VARCHAR(50) DEFAULT 'pinata',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System configuration
CREATE TABLE system_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_children_parent_id ON children(parent_id);
CREATE INDEX idx_children_age ON children(age);
CREATE INDEX idx_game_sessions_child_id ON game_sessions(child_id);
CREATE INDEX idx_game_sessions_started_at ON game_sessions(started_at);
CREATE INDEX idx_word_mastery_child_id ON word_mastery(child_id);
CREATE INDEX idx_word_mastery_next_review ON word_mastery(next_review);
CREATE INDEX idx_achievements_child_id ON achievements(child_id);
CREATE INDEX idx_achievements_earned_at ON achievements(earned_at);
CREATE INDEX idx_certificates_child_id ON certificates(child_id);
CREATE INDEX idx_certificates_issued_at ON certificates(issued_at);
CREATE INDEX idx_leaderboards_type_period ON leaderboards(leaderboard_type, period);
CREATE INDEX idx_leaderboards_rank ON leaderboards(rank);
CREATE INDEX idx_classroom_students_classroom_id ON classroom_students(classroom_id);
CREATE INDEX idx_blockchain_transactions_hash ON blockchain_transactions(transaction_hash);
CREATE INDEX idx_blockchain_transactions_status ON blockchain_transactions(status);

-- Insert default achievement types
INSERT INTO achievement_types (name, description, category, requirement_type, requirement_value, rarity) VALUES
('First Steps', 'Complete your first spelling word!', 'milestone', 'words_mastered', 1, 'common'),
('Word Explorer', 'Master 10 different words', 'milestone', 'words_mastered', 10, 'common'),
('Spelling Apprentice', 'Master 50 words', 'milestone', 'words_mastered', 50, 'rare'),
('Vocabulary Hero', 'Master 100 words', 'milestone', 'words_mastered', 100, 'rare'),
('Spelling Champion', 'Master 500 words', 'milestone', 'words_mastered', 500, 'epic'),
('Perfect Streak', 'Get 10 words correct in a row', 'performance', 'perfect_streak', 10, 'rare'),
('Speed Demon', 'Complete 20 words in under 2 minutes', 'performance', 'speed_challenge', 20, 'rare'),
('Daily Learner', 'Play for 7 consecutive days', 'engagement', 'daily_streak', 7, 'common'),
('Dedicated Student', 'Play for 30 consecutive days', 'engagement', 'daily_streak', 30, 'epic'),
('Animal Expert', 'Master all animal words in your level', 'category', 'category_mastery', 1, 'rare'),
('Color Master', 'Master all color words in your level', 'category', 'category_mastery', 1, 'rare'),
('Fruit Fanatic', 'Master all fruit words in your level', 'category', 'category_mastery', 1, 'rare'),
('Level Complete', 'Complete an entire difficulty level', 'progression', 'level_completion', 1, 'epic'),
('Phonics Pro', 'Master all vowel and consonant sounds', 'skill', 'phonics_mastery', 1, 'legendary');

-- Insert default system configuration
INSERT INTO system_config (config_key, config_value, description, is_public) VALUES
('achievement_nft_contract', '{"address": "", "network": "celo"}', 'Achievement NFT contract details', false),
('certificate_contract', '{"address": "", "network": "celo"}', 'Certificate contract details', false),
('leaderboard_contract', '{"address": "", "network": "celo"}', 'Leaderboard contract details', false),
('ipfs_gateway', '{"url": "https://gateway.pinata.cloud/ipfs/"}', 'IPFS gateway URL', true),
('max_daily_playtime', '{"minutes": 120}', 'Maximum daily playtime for children', true),
('privacy_policy_version', '{"version": "1.0", "effective_date": "2024-01-01"}', 'Current privacy policy version', true);