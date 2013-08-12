#-- encoding: UTF-8
#-- copyright
# OpenProject is a project management system.
#
# Copyright (C) 2012-2013 the OpenProject Team
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License version 3.
#
# See doc/COPYRIGHT.rdoc for more details.
#++

class Journal < ActiveRecord::Base
  self.table_name = "journals"

  include JournalFormatter
  include FormatHooks

  register_journal_formatter :diff, OpenProject::JournalFormatter::Diff
  register_journal_formatter :attachment, OpenProject::JournalFormatter::Attachment
  register_journal_formatter :custom_field, OpenProject::JournalFormatter::CustomField
  register_journal_formatter :scenario_date, OpenProject::JournalFormatter::ScenarioDate

  attr_accessible :journaled_type, :journaled_id, :activity_type, :version, :notes, :user_id

  # Make sure each journaled model instance only has unique version ids
  validates_uniqueness_of :version, :scope => [:journaled_id, :journaled_type]

  belongs_to :user

  after_save :save_data

  # Scopes to all journals excluding the initial journal - useful for change
  # logs like the history on issue#show
  scope "changing", :conditions => ["version > 1"]

  def journaled
    journalized_object_type.find(journaled_id)
  end

  def changed_data=(changed_attributes)
    attributes = changed_attributes

    if attributes.kind_of? Hash and attributes.values.first.kind_of? Array
      attributes.each {|k,v| attributes[k] = v[1]}
    end

    data.update_attributes attributes
  end

  # In conjunction with the included Comparable module, allows comparison of journal records
  # based on their corresponding version numbers, creation timestamps and IDs.
  def <=>(other)
    [version, created_at, id].map(&:to_i) <=> [other.version, other.created_at, other.id].map(&:to_i)
  end

  # Returns whether the version has a version number of 1. Useful when deciding whether to ignore
  # the version during reversion, as initial versions have no serialized changes attached. Helps
  # maintain backwards compatibility.
  def initial?
    version < 2
  end

  # The anchor number for html output
  def anchor
    version - 1
  end

  # Possible shortcut to the associated project
  def project
    if journaled.respond_to?(:project)
      journaled.project
    elsif journaled.is_a? Project
      journaled
    else
      nil
    end
  end

  def editable_by?(user)
    journaled.journal_editable_by?(user)
  end

  def details
    get_changes
  end

  alias_method :changed_data, :details

  def new_value_for(prop)
    details[prop.to_s].last if details.keys.include? prop.to_s
  end

  def old_value_for(prop)
    details[prop.to_s].first if details.keys.include? prop.to_s
  end

  def data
    @data ||= "Journal::#{journaled_type}".constantize.find_by_journal_id(id)
  end

  def data=(data)
    @data = data
  end

  private

  def save_data
    data.journal_id = id if data.new_record?
    data.save!
  end

  def get_changes
    return {} if data.nil?

    if @changes.nil?
      @changes = {}

      if predecessor.nil?
        @changes = data.journaled_attributes.select{|_,v| !v.nil?}
                                            .inject({}) { |h, (k, v)| h[k] = [(true if Float(v) rescue false) ? 0 : nil, v]; h }
      else
        predecessor_data = predecessor.data.journaled_attributes
        data.journaled_attributes.select{|k,v| v != predecessor_data[k]}.each do |k, v|
          @changes[k] = [predecessor_data[k], v]
        end
      end
    end

    @changes
  end

  def predecessor
    @predecessor ||= Journal.where("journaled_type = ? AND journaled_id = ? AND created_at <= ? AND id < ?",
                                   journaled_type, journaled_id, created_at, id)
                            .order("created_at DESC")
                            .first
  end

  def journalized_object_type
    "#{journaled_type.gsub('Journal', '')}".constantize
  end
end
