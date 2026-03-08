# frozen_string_literal: true

require 'fileutils'
require 'open3'
require 'pathname'
require 'tmpdir'

# rubocop:disable RSpec/DescribeClass
RSpec.describe 'local environment bootstrap scripts' do
  let(:repo_root) { Pathname(__dir__).join('..', '..').expand_path }
  let(:env_example_contents) do
    <<~ENV
      LOCAL_DOMAIN=localhost:3000
      DB_HOST=localhost
      REDIS_HOST=localhost
    ENV
  end

  def with_app_root
    Dir.mktmpdir('env-bootstrap') do |dir|
      app_root = Pathname(dir)

      FileUtils.mkdir_p(app_root.join('bin'))
      FileUtils.mkdir_p(app_root.join('docs'))
      FileUtils.cp(repo_root.join('bin/dev'), app_root.join('bin/dev'), preserve: true)
      FileUtils.cp(repo_root.join('bin/setup'), app_root.join('bin/setup'), preserve: true)
      File.write(app_root.join('.env.example'), env_example_contents)
      File.write(app_root.join('Procfile.dev'), "web: echo hi\n")

      yield app_root
    end
  end

  def setup_stub
    <<~RUBY
      module Kernel
        def system(*args, exception: false)
          true
        end
      end

      load './bin/setup'
    RUBY
  end

  def sanitized_env(env = {})
    {
      'DATABASE_URL' => nil,
      'DB_HOST' => nil,
      'LOCAL_DOMAIN' => nil,
      'PORT' => nil,
      'RAILS_ENV' => nil,
      'REDIS_HOST' => nil,
      'REMOTE_DEV' => nil,
      'VAGRANT' => nil,
    }.merge(env)
  end

  def run_bin_setup(app_root, env = {})
    Open3.capture3(sanitized_env(env), 'ruby', '-e', setup_stub, chdir: app_root.to_s)
  end

  def write_overmind_stub(app_root)
    stub_dir = app_root.join('stubs')
    stub_path = stub_dir.join('overmind')

    FileUtils.mkdir_p(stub_dir)
    File.write(stub_path, <<~SH)
      #!/usr/bin/env sh
      printf 'cwd=%s\n' "$PWD"
      printf 'args=%s\n' "$*"
    SH
    FileUtils.chmod(0o755, stub_path)

    stub_dir
  end

  def run_bin_dev(app_root, env = {}, from: app_root)
    stub_dir = write_overmind_stub(app_root)
    command = from == app_root ? './bin/dev' : '../bin/dev'
    full_env = sanitized_env({ 'PATH' => "#{stub_dir}:#{ENV.fetch('PATH')}" }.merge(env))

    Open3.capture3(full_env, command, chdir: from.to_s)
  end

  shared_examples 'bootstraps from .env.example' do |script_name|
    it 'bootstraps for default-like local overrides' do
      with_app_root do |app_root|
        [
          { 'LOCAL_DOMAIN' => 'localhost:3000' },
          { 'DB_HOST' => 'localhost' },
          { 'REDIS_HOST' => '127.0.0.1' },
        ].each do |env_overrides|
          stdout, stderr, status = if script_name == :setup
                                     run_bin_setup(app_root, env_overrides)
                                   else
                                     run_bin_dev(app_root, env_overrides)
                                   end

          expect(status.success?).to be(true), -> { "#{stdout}\n#{stderr}" }
          expect(app_root.join('.env')).to exist
          expect(app_root.join('.env').read).to eq(env_example_contents)

          app_root.join('.env').delete
        end
      end
    end

    it 'skips bootstrap for managed overrides' do
      with_app_root do |app_root|
        stdout, stderr, status = if script_name == :setup
                                   run_bin_setup(app_root, 'DB_HOST' => 'db')
                                 else
                                   run_bin_dev(app_root, { 'DB_HOST' => 'db' })
                                 end

        expect(status.success?).to be(true), -> { "#{stdout}\n#{stderr}" }
        expect(app_root.join('.env')).to_not exist
      end
    end
  end

  describe 'bin/setup' do
    it_behaves_like 'bootstraps from .env.example', :setup
  end

  describe 'bin/dev' do
    it_behaves_like 'bootstraps from .env.example', :dev

    it 'anchors launch to the app root from a subdirectory' do
      with_app_root do |app_root|
        stdout, stderr, status = run_bin_dev(app_root, {}, from: app_root.join('docs'))

        expect(status.success?).to be(true), -> { "#{stdout}\n#{stderr}" }
        expect(stdout).to include("cwd=#{app_root.realpath}")
        expect(app_root.join('.env')).to exist
        expect(app_root.join('.env').read).to eq(env_example_contents)
      end
    end
  end
end
# rubocop:enable RSpec/DescribeClass
