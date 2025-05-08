# データベース構造と修正案

## 現在のデータベース構造

### applicant_profiles
| カラム名 | データ型 | NULL許可 | 説明 |
|---------|---------|---------|------|
| id | uuid | NO | 主キー |
| applicant_firstname | character varying | YES | 名 |
| applicant_lastname | character varying | YES | 姓 |
| applicant_email | character varying | YES | メールアドレス |
| applicant_phone | character varying | YES | 電話番号 |
| applicant_address | text | YES | 住所 |
| applicant_birthday | date | YES | 生年月日 |
| applicant_gender | character varying | YES | 性別 |
| applicant_languages | text | YES | 使用言語 |
| applicant_hobbies | text | YES | 趣味 |
| applicant_self_introduction | text | YES | 自己紹介 |
| applicant_education | jsonb | YES | 学歴 |
| applicant_experience | jsonb | YES | 職歴 |
| applicant_skills | jsonb | YES | スキル |
| applicant_certifications | jsonb | YES | 資格 |
| created_at | timestamp with time zone | YES | 作成日時 |
| updated_at | timestamp with time zone | YES | 更新日時 |

### applications
| カラム名 | データ型 | NULL許可 | 説明 |
|---------|---------|---------|------|
| id | uuid | NO | 主キー |
| applicant_id | uuid | NO | 応募者ID |
| company_id | uuid | NO | 企業ID |
| status | character varying | YES | ステータス |
| applied_at | timestamp without time zone | NO | 応募日時 |
| updated_at | timestamp without time zone | YES | 更新日時 |

### companies
| カラム名 | データ型 | NULL許可 | 説明 |
|---------|---------|---------|------|
| id | uuid | NO | 主キー |
| name | text | NO | 企業名 |
| created_at | timestamp with time zone | YES | 作成日時 |
| updated_at | timestamp with time zone | YES | 更新日時 |

### recruiter_profiles
| カラム名 | データ型 | NULL許可 | 説明 |
|---------|---------|---------|------|
| id | uuid | NO | 主キー |
| company_name | character varying | NO | 企業名 |
| company_address | text | YES | 企業住所 |
| company_website | character varying | YES | 企業ウェブサイト |
| department | character varying | YES | 部署 |
| position | character varying | YES | 役職 |
| recruiter_firstname | character varying | YES | 採用担当者名 |
| recruiter_lastname | character varying | YES | 採用担当者姓 |
| recruiter_email | character varying | YES | 採用担当者メール |
| recruiter_phone | character varying | YES | 採用担当者電話番号 |
| company_description | text | YES | 企業説明 |
| hiring_process | text | YES | 採用プロセス |
| company_benefits | text | YES | 企業福利厚生 |
| created_at | timestamp with time zone | YES | 作成日時 |
| updated_at | timestamp with time zone | YES | 更新日時 |
| company_id | uuid | YES | 企業ID |

### skill_tests
| カラム名 | データ型 | NULL許可 | 説明 |
|---------|---------|---------|------|
| id | uuid | NO | 主キー |
| title | character varying | NO | テストタイトル |
| category | character varying | NO | カテゴリ |
| programming_language | character varying | NO | プログラミング言語 |
| experience_level | character varying | NO | 経験レベル |
| difficulty | character varying | NO | 難易度 |
| test_type | character varying | NO | テストタイプ |
| question_count | integer | NO | 問題数 |
| time_limit | integer | NO | 制限時間 |
| company_id | uuid | YES | 企業ID |
| created_at | timestamp with time zone | YES | 作成日時 |
| updated_at | timestamp with time zone | YES | 更新日時 |
| status | boolean | YES | ステータス |

### test_applicants
| カラム名 | データ型 | NULL許可 | 説明 |
|---------|---------|---------|------|
| id | uuid | NO | 主キー |
| test_id | uuid | YES | テストID |
| applicant_id | uuid | YES | 応募者ID |
| status | character varying | NO | ステータス |
| score | integer | YES | スコア |
| started_at | timestamp with time zone | YES | 開始日時 |
| completed_at | timestamp with time zone | YES | 完了日時 |
| created_at | timestamp with time zone | YES | 作成日時 |

### test_questions
| カラム名 | データ型 | NULL許可 | 説明 |
|---------|---------|---------|------|
| id | uuid | NO | 主キー |
| test_id | uuid | YES | テストID |
| question_text | text | NO | 問題文 |
| prompt | text | YES | プロンプト |
| created_at | timestamp with time zone | YES | 作成日時 |

### test_responses
| カラム名 | データ型 | NULL許可 | 説明 |
|---------|---------|---------|------|
| id | uuid | NO | 主キー |
| test_id | uuid | YES | テストID |
| applicant_id | uuid | YES | 応募者ID |
| answer | text | NO | 回答 |
| score | integer | YES | スコア |
| created_at | timestamp with time zone | YES | 作成日時 |
| updated_at | timestamp with time zone | YES | 更新日時 |
| code_quality_score | integer | YES | コード品質スコア |
| maintainability_score | integer | YES | 保守性スコア |
| algorithm_score | integer | YES | アルゴリズムスコア |
| readability_score | integer | YES | 可読性スコア |
| performance_score | integer | YES | パフォーマンススコア |
| review_comments | text | YES | レビューコメント |

## 必要な修正

### 1. jobs テーブルの追加
```sql
CREATE TABLE jobs (
    id UUID PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    benefits TEXT,
    salary_range VARCHAR(100),
    location VARCHAR(255),
    employment_type VARCHAR(50),
    status VARCHAR(20) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 2. applications テーブルの修正
```sql
ALTER TABLE applications
ADD COLUMN job_id UUID REFERENCES jobs(id);
```

### 3. skill_tests テーブルの修正
```sql
ALTER TABLE skill_tests
ADD COLUMN job_id UUID REFERENCES jobs(id);
```

### 4. インデックスの追加
```sql
-- jobs テーブルのインデックス
CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_jobs_status ON jobs(status);

-- applications テーブルのインデックス
CREATE INDEX idx_applications_job_id ON applications(job_id);

-- skill_tests テーブルのインデックス
CREATE INDEX idx_skill_tests_job_id ON skill_tests(job_id);
```

## 移行手順

1. バックアップの作成
2. jobs テーブルの作成
3. applications テーブルへの job_id カラム追加
4. skill_tests テーブルへの job_id カラム追加
5. インデックスの作成
6. 既存データの移行（必要な場合）
7. アプリケーションコードの更新 