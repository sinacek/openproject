#-- encoding: UTF-8
#-- copyright
# OpenProject is a project management system.
# Copyright (C) 2012-2018 the OpenProject Foundation (OPF)
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License version 3.
#
# OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
# Copyright (C) 2006-2017 Jean-Philippe Lang
# Copyright (C) 2010-2013 the ChiliProject Team
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License
# as published by the Free Software Foundation; either version 2
# of the License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
#
# See docs/COPYRIGHT.rdoc for more details.
#++

# Enqueues
class EnqueueWorkPackageNotificationJob < ApplicationJob
  include Notifications::JournalNotifier

  def initialize(journal_id, author_id)
    @journal_id = journal_id
    @author_id = author_id
  end

  def perform
    # if the WP has been deleted the unaggregated journal will have been deleted too
    # and our job here is done
    return unless raw_journal

    journal = find_aggregated_journal_for(raw_journal)

    # If we can't find the aggregated journal, it was superseded by a journal that aggregated ours.
    # In that case a job for the new journal will have been enqueued that is now responsible for
    # sending the notification. Our job here is done.
    return unless journal

    # Do not deliver notifications if a follow-up journal will already have sent a notification
    # on behalf of this job.
    return if Journal::AggregatedJournal.hides_notifications?(journal.successor, journal)

    author = User.find_by(id: @author_id) || DeletedUser.first
    User.execute_as(author) do
      notify_journal_complete(work_package, journal)
    end
  end

  private

  def raw_journal
    @raw_journal ||= Journal.find_by(id: @journal_id)
  end

  def work_package
    @work_package ||= raw_journal.journable
  end
end
